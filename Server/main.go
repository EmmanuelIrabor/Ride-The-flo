
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Article struct {
	ID       string `json:"id"`
	Category string `json:"category"`
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
	Author   string `json:"author"`
	Date     string `json:"date"`
	Image    string `json:"image"`
	Content  string `json:"content"`
}

var imageDomain = "assets/images/blog"

func generateRandomID() string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	rand.Seed(time.Now().UnixNano())
	length := rand.Intn(3) + 6 // length 6-8
	var sb strings.Builder
	for i := 0; i < length; i++ {
		sb.WriteByte(charset[rand.Intn(len(charset))])
	}
	return sb.String()
}

func submitHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Could not parse form", http.StatusBadRequest)
		return
	}

	article := Article{
		ID:       generateRandomID(),
		Category: r.FormValue("category"),
		Title:    r.FormValue("title"),
		Subtitle: r.FormValue("subtitle"),
		Author:   r.FormValue("author"),
		Date:     r.FormValue("date"),
		Content:  r.FormValue("content"),
	}

	file, handler, err := r.FormFile("image")
	if err == nil {
		defer file.Close()
		timestamp := time.Now().Unix()
		ext := filepath.Ext(handler.Filename)
		imageFilename := fmt.Sprintf("image_%d%s", timestamp, ext)
		imagePath := filepath.Join("assets", "images", "blog", imageFilename)

		dst, err := os.Create(imagePath)
		if err != nil {
			http.Error(w, "Unable to save image", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		_, err = io.Copy(dst, file)
		if err != nil {
			http.Error(w, "Failed to save image", http.StatusInternalServerError)
			return
		}

		article.Image = fmt.Sprintf("%s/%s", imageDomain, imageFilename)
	} else {
		article.Image = ""
	}

	var articles []Article
	fileData, err := os.ReadFile("articles.json")
	if err == nil {
		json.Unmarshal(fileData, &articles)
	}

	articles = append(articles, article)
	data, _ := json.MarshalIndent(articles, "", "  ")
	err = os.WriteFile("articles.json", data, 0644)
	if err != nil {
		http.Error(w, "Failed to save article", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Article submitted successfully!")
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "🟢 Go server is live and ready. Use POST /submit to upload articles.")
}

func notFoundHandler(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "🚫 Route not found. Check your endpoint.", http.StatusNotFound)
}

func main() {
	// Ensure directories exist
	os.MkdirAll("assets/images/blog", os.ModePerm)

	router := mux.NewRouter()

	// Routes
	router.HandleFunc("/", homeHandler).Methods("GET")
	router.HandleFunc("/submit", submitHandler).Methods("POST", "OPTIONS")

	// Static file serving
	fs := http.FileServer(http.Dir("./assets"))
	router.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", fs))

	// Custom 404
	router.NotFoundHandler = http.HandlerFunc(notFoundHandler)

	// CORS setup
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type"}),
	)(router)

	fmt.Println("🚀 Golang Server is Live !")
	http.ListenAndServe(":8080", corsHandler)
}
