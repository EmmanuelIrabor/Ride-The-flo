
document
        .getElementById("articleForm")
        .addEventListener("submit", async function (e) {
          e.preventDefault();

          const form = document.getElementById("articleForm");
          const formData = new FormData(form); 

          try {
            const response = await fetch("http://localhost:8080/submit", {
              method: "POST",
              body: formData,
            });

            if (response.ok) {
              alert("Article submitted successfully!");
              form.reset();
            } else {
              alert("Error submitting article.");
            }
          } catch (err) {
            console.error(err);
            alert("Request failed.");
          }
        });