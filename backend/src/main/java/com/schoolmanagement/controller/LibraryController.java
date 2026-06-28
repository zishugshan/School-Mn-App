package com.schoolmanagement.controller;

import com.schoolmanagement.dto.request.BookRequest;
import com.schoolmanagement.dto.response.ApiResponse;
import com.schoolmanagement.dto.response.BookResponse;
import com.schoolmanagement.service.LibraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;

    @GetMapping("/books")
    public ApiResponse<List<BookResponse>> getAllBooks() {
        List<BookResponse> books = libraryService.getAllBooks();
        return ApiResponse.success(books, "Books retrieved successfully");
    }

    @GetMapping("/books/{id}")
    public ApiResponse<BookResponse> getBookById(@PathVariable Long id) {
        BookResponse book = libraryService.getBookById(id);
        return ApiResponse.success(book, "Book retrieved successfully");
    }

    @GetMapping("/books/search")
    public ApiResponse<List<BookResponse>> searchBooks(@RequestParam String query) {
        List<BookResponse> books = libraryService.searchBooks(query);
        return ApiResponse.success(books, "Books retrieved successfully");
    }

    @GetMapping("/my-books")
    public ApiResponse<List<Map<String, Object>>> getMyBooks() {
        return ApiResponse.success(libraryService.getMyBooks(), "My books retrieved successfully");
    }

    @GetMapping("/records")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<List<Map<String, Object>>> getAllRecords() {
        return ApiResponse.success(libraryService.getAllRecords(), "Records retrieved successfully");
    }

    @PostMapping("/books")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<BookResponse> addBook(@Valid @RequestBody BookRequest request) {
        BookResponse book = libraryService.addBook(request);
        return ApiResponse.success(book, "Book added successfully");
    }

    @PutMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<BookResponse> updateBook(
            @PathVariable Long id, @Valid @RequestBody BookRequest request) {
        BookResponse book = libraryService.updateBook(id, request);
        return ApiResponse.success(book, "Book updated successfully");
    }

    @DeleteMapping("/books/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<Void> deleteBook(@PathVariable Long id) {
        libraryService.deleteBook(id);
        return ApiResponse.success(null, "Book deleted successfully");
    }

    @PostMapping("/books/{bookId}/issue/{studentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<?> issueBook(
            @PathVariable Long bookId, @PathVariable Long studentId) {
        return ApiResponse.success(libraryService.issueBook(bookId, studentId), "Book issued successfully");
    }

    @PutMapping("/books/issue/{issueId}/return")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
    public ApiResponse<?> returnBook(@PathVariable Long issueId) {
        return ApiResponse.success(libraryService.returnBook(issueId), "Book returned successfully");
    }
}
