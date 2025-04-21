
//light-dark mode

const toggleBtn = document.getElementById('theme-toggle-btn');

const icon = toggleBtn.querySelector('i');

// Function to apply theme based on mode
function applyTheme(mode) {
  const isDarkMode = mode === 'dark';
  document.body.classList.toggle('light', !isDarkMode);

  icon.classList.remove(isDarkMode ? 'ph-moon' : 'ph-sun');
  icon.classList.add(isDarkMode ? 'ph-sun' : 'ph-moon');
}

// On page load: check localStorage
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

// Toggle theme on button click
toggleBtn.addEventListener('click', () => {
  const isCurrentlyDark = !document.body.classList.contains('light');
  const newTheme = isCurrentlyDark ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
});

//mobile-menu 

const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const closemobileMenu = document.querySelector('.mobile-menu-close');


menuBtn.addEventListener('click', () => {
  // Toggle the mobile menu visibility
  mobileMenu.classList.toggle('show');
  
});

closemobileMenu.addEventListener('click', () => {
  // Toggle the mobile menu visibility
  mobileMenu.classList.toggle('show');
  
});

//Marquee Articles


 fetch("../Server/articles.json")
            .then((response) => response.json())
            .then((data) => {
              const marquee = document.getElementById("news-marquee");

              data.forEach((article) => {
                const link = document.createElement("a");
                link.href = `http://127.0.0.1:5067/Article/?id=${article.id}`;
                link.textContent = article.title + " • ";
                marquee.appendChild(link);
              });
            })
            .catch((error) => {
              console.error("Failed to load articles:", error);
            });



//Home Articles

fetch("http://127.0.0.1:5067/Server/articles.json")
        .then((response) => response.json())
        .then((articles) => {
          const container = document.getElementById("articles-container");
          let i = 0;

          while (i < articles.length) {
            const large = articles[i];
            const smallSet = articles.slice(i + 1, i + 5);

            let html = `
          <div class="container d-flex flex-column flex-lg-row aligin-items-center justify-items-center justify-content-center mb-5">
            <div class="col-12 col-lg-6 border-red-right">
              <div>
                <a class="large-article" href="Article/?id=${large.id}">
                  <div class="large-article-img">
                    <img class="img-fluid pl-5" src="assets/images/blog/pexels-olly-813940.jpg" />
                  </div>
                  <div class="large-article-titles">
                    <h3 class="mt-3 fw-bold">${large.title}</h3>
                    <p class="mr-5">${large.subtitle}</p>
                  </div>
                </a>
                <div class="large-article-info d-flex flex-row gap-3">
                  <div><p class="text-secondary">${large.author} &nbsp; |</p></div>
                  <div><p class="text-secondary">${large.date}</p></div>
                </div>
              </div>
            </div>

            <div class="col-12 col-lg-6 pt-3">
              <div class="small-articles d-flex flex-column">
        `;

            smallSet.forEach((article) => {
              html += `
            <a class="small-article-link mt-4" href="Article/?id=${article.id}">
              <div class="small-article d-flex flex-row">
                <div class="col-8 p-lg-3 pt-0 pl-0 pr-0 pb-0 small-article-titles">
                  <h5 class="fw-bold">${article.title}</h5>
                  <p>${article.subtitle}</p>
                  <div class="small-article-info d-flex flex-row gap-3">
                    <div><p class="text-secondary">${article.author} &nbsp; |</p></div>
                    <div><p class="text-secondary">${article.date}</p></div>
                  </div>
                </div>
                <div class="col-4 small-article-img">
                  <img class="img-fluid h-90" src="Server/${article.image}" alt="small-article-img" />
                </div>
              </div>
            </a>
          `;
            });

            html += `
              </div>
            </div>
          </div>
        `;

            container.innerHTML += html;
            i += 5;
          }
        })
        .catch((err) => {
          console.error("Error loading articles:", err);
          document.getElementById(
            "articles-container"
          ).innerHTML = `<p>Failed to load articles. Please try again later.</p>`;
        });


//Article Page

async function loadArticle() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");

        if (!id) {
          document.getElementById("title").textContent = "No Article ID Found.";
          return;
        }

        try {
          const res = await fetch("http://127.0.0.1:5067/Server/articles.json");
          const articles = await res.json();

          const article = articles.find((a) => a.id === id);

          if (!article) {
            document.getElementById("title").textContent = "Article not found.";
            return;
          }

          document.title = `RTF - ${article.title}`;
          document.getElementById(
            "page-title"
          ).textContent = `RTF - ${article.title}`;
          document.getElementById("category").textContent = article.category;
          document.getElementById("title").textContent = article.title;
          document.getElementById("subtitle").textContent = article.subtitle;
          document.getElementById(
            "author"
          ).textContent = `By ${article.author}`;
          document.getElementById("date").textContent = article.date;
          document.getElementById("cover-image").src =
            "../Server/" + article.image;
          document.getElementById("content").innerHTML = article.content;

          // Update meta tags
          document
            .querySelector('meta[name="description"]')
            .setAttribute("content", article.subtitle);
          document
            .querySelector('meta[property="og:title"]')
            .setAttribute("content", article.title);
          document
            .querySelector('meta[property="og:description"]')
            .setAttribute("content", article.subtitle);
          document
            .querySelector('meta[property="og:image"]')
            .setAttribute("content", article.image);
          document
            .querySelector('meta[name="twitter:title"]')
            .setAttribute("content", article.title);
          document
            .querySelector('meta[name="twitter:description"]')
            .setAttribute("content", article.subtitle);
          document
            .querySelector('meta[name="twitter:image"]')
            .setAttribute("content", article.image);
        } catch (err) {
          console.error("Failed to load article:", err);
          document.getElementById("title").textContent =
            "Error loading article.";
        }
      }

      window.onload = loadArticle;

//Related Articles

fetch("../Server/articles.json")
        .then((response) => response.json())
        .then((data) => {
          const container = document.getElementById("related-articles");

          // Shuffle array
          const shuffled = data.sort(() => 0.5 - Math.random());

          // Get first 4 from shuffled array
          const randomArticles = shuffled.slice(0, 4);

          randomArticles.forEach((article) => {
            const articleHTML = `
        <a href="http://127.0.0.1:5067/Article/?id=${article.id}">
          <div class="related-article d-flex flex-column">
            <img
              class="img-fluid related-article-image"
              src="../assets/images/blog/pexels-olly-813940.jpg"
              alt="${article.title}"
            />
            <p class="fw-bold mt-3 col-9 col-md-12">
              ${article.title}
            </p>
            <span class="text-secondary">${article.author}</span>
          </div>
        </a>
      `;

            container.insertAdjacentHTML("beforeend", articleHTML);
          });
        })
        .catch((err) => console.error("Could not load related articles:", err));