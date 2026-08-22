const savedTheme = localStorage.getItem("kaizen-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
  document.documentElement.dataset.theme = "dark";
}

document.addEventListener("DOMContentLoaded", () => {
  const issueDate = document.getElementById("issueDate");
  const today = new Date();
  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  if (issueDate instanceof HTMLInputElement && !issueDate.value) {
    issueDate.value = localDate;
  }

  const form = document.querySelector("form");
  const submitButton = form.querySelector('button[type="submit"]');
  const successNotice = document.getElementById("successNotice");
  const newKaizenButton = document.getElementById("newKaizenButton");
  const dismissNoticeButton = document.getElementById("dismissNoticeButton");
  const cropModal = document.getElementById("cropModal");
  const cropImage = document.getElementById("cropImage");
  const applyCropButton = document.getElementById("applyCropButton");
  const cancelCropButton = document.getElementById("cancelCropButton");
  const cancelCropAction = document.getElementById("cancelCropAction");
  let cropper;
  let activePhotoInput;
  let previewUrl;

  const closeCropper = (clearInput) => {
    cropper?.destroy();
    cropper = undefined;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = undefined;
    }

    if (clearInput && activePhotoInput) {
      activePhotoInput.value = "";
    }

    activePhotoInput = undefined;
    cropModal.hidden = true;
  };

  const openCropper = (input) => {
    const photo = input.files?.[0];

    if (!photo) {
      return;
    }

    closeCropper(false);
    activePhotoInput = input;
    previewUrl = URL.createObjectURL(photo);
    cropImage.src = previewUrl;
    cropModal.hidden = false;

    cropImage.onload = () => {
      cropper = new Cropper(cropImage, {
        autoCropArea: 1,
        viewMode: 1,
      });
    };
  };

  document.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener("change", () => openCropper(input));
  });

  applyCropButton.addEventListener("click", () => {
    if (!cropper || !activePhotoInput) {
      return;
    }

    cropper
      .getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
        maxHeight: 1200,
        maxWidth: 1600,
      })
      .toBlob(
        (blob) => {
          if (!blob) {
            return;
          }

          const croppedFile = new File(
            [blob],
            activePhotoInput.files?.[0]?.name ?? "photograph.jpg",
            { type: "image/jpeg" },
          );
          const fileTransfer = new DataTransfer();

          fileTransfer.items.add(croppedFile);
          activePhotoInput.files = fileTransfer.files;
          closeCropper(false);
        },
        "image/jpeg",
        0.85,
      );
  });

  cancelCropButton.addEventListener("click", () => closeCropper(true));
  cancelCropAction.addEventListener("click", () => closeCropper(true));

  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle.querySelector(".theme-icon");

  const updateThemeToggle = () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    themeIcon.textContent = isDark ? "☼" : "◐";
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );
  };

  updateThemeToggle();

  const setTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("kaizen-theme", theme);
    updateThemeToggle();
  };

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    const nextTheme = isDark ? "light" : "dark";

    if (document.startViewTransition) {
      document.startViewTransition(() => setTheme(nextTheme));
    } else {
      setTheme(nextTheme);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    submitButton.textContent = "Preparing workbook...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
      });

      if (!response.ok) {
        throw new Error("Workbook generation failed.");
      }

      const filename =
        response.headers
          .get("Content-Disposition")
          ?.match(/filename="?([^";]+)"?/)?.[1] ?? "kaizen.xlsx";
      const downloadUrl = URL.createObjectURL(await response.blob());
      const downloadLink = document.createElement("a");

      downloadLink.href = downloadUrl;
      downloadLink.download = filename;
      downloadLink.click();
      URL.revokeObjectURL(downloadUrl);

      successNotice.hidden = false;
      successNotice.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to generate the Excel file. Please try again.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Generate Excel";
    }
  });

  newKaizenButton.addEventListener("click", () => {
    form.reset();
    issueDate.value = localDate;
    successNotice.hidden = true;
    document.getElementById("theme").focus();
  });

  dismissNoticeButton.addEventListener("click", () => {
    successNotice.hidden = true;
  });
});
