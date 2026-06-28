package com.schoolmanagement.service;

import com.schoolmanagement.dto.request.BookRequest;
import com.schoolmanagement.dto.response.BookResponse;
import com.schoolmanagement.entity.BookIssue;
import com.schoolmanagement.entity.LibraryBook;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.exception.BadRequestException;
import com.schoolmanagement.exception.ResourceNotFoundException;
import com.schoolmanagement.repository.BookIssueRepository;
import com.schoolmanagement.repository.LibraryBookRepository;
import com.schoolmanagement.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.schoolmanagement.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
@Transactional
public class LibraryService {

    private final LibraryBookRepository libraryBookRepository;
    private final BookIssueRepository bookIssueRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public List<BookResponse> getAllBooks() {
        return libraryBookRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookResponse> searchBooks(String query) {
        List<LibraryBook> byTitle = libraryBookRepository.findByTitleContainingIgnoreCase(query);
        List<LibraryBook> byAuthor = libraryBookRepository.findByAuthorContainingIgnoreCase(query);

        return byTitle.stream()
                .filter(b -> b.getIsActive() != null && b.getIsActive())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookResponse getBookById(Long id) {
        LibraryBook book = libraryBookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        return toResponse(book);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyBooks() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        List<BookIssue> issues = bookIssueRepository.findByStudentUserId(userId);
        return issues.stream().map(this::issueToMap).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllRecords() {
        return bookIssueRepository.findAllByOrderByIssueDateDesc().stream()
                .map(this::issueToMap)
                .collect(Collectors.toList());
    }

    public BookResponse addBook(BookRequest request) {
        LibraryBook book = LibraryBook.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .publisher(request.getPublisher())
                .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                .available(request.getQuantity() != null ? request.getQuantity() : 1)
                .category(request.getCategory())
                .isActive(true)
                .build();

        book = libraryBookRepository.save(book);
        return toResponse(book);
    }

    public BookResponse updateBook(Long id, BookRequest request) {
        LibraryBook book = libraryBookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setPublisher(request.getPublisher());

        if (request.getQuantity() != null) {
            int diff = request.getQuantity() - (book.getQuantity() != null ? book.getQuantity() : 0);
            book.setQuantity(request.getQuantity());
            book.setAvailable((book.getAvailable() != null ? book.getAvailable() : 0) + diff);
        }

        book.setCategory(request.getCategory());
        book = libraryBookRepository.save(book);
        return toResponse(book);
    }

    public void deleteBook(Long id) {
        LibraryBook book = libraryBookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", id));
        book.setIsActive(false);
        libraryBookRepository.save(book);
    }

    public Map<String, Object> issueBook(Long bookId, Long studentId) {
        LibraryBook book = libraryBookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book", "id", bookId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        if (book.getAvailable() == null || book.getAvailable() <= 0) {
            throw new BadRequestException("No copies available for this book");
        }

        BookIssue issue = BookIssue.builder()
                .book(book)
                .student(student)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(14))
                .status("ISSUED")
                .build();

        book.setAvailable(book.getAvailable() - 1);
        libraryBookRepository.save(book);
        issue = bookIssueRepository.save(issue);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", issue.getId());
        result.put("bookId", book.getId());
        result.put("bookTitle", book.getTitle());
        result.put("studentId", student.getId());
        result.put("studentName", student.getUser().getFirstName() + " " + student.getUser().getLastName());
        result.put("issueDate", issue.getIssueDate());
        result.put("dueDate", issue.getDueDate());
        result.put("status", issue.getStatus());
        return result;
    }

    public Map<String, Object> returnBook(Long issueId) {
        BookIssue issue = bookIssueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("BookIssue", "id", issueId));

        issue.setReturnDate(LocalDate.now());
        issue.setStatus("RETURNED");

        LibraryBook book = issue.getBook();
        book.setAvailable((book.getAvailable() != null ? book.getAvailable() : 0) + 1);
        libraryBookRepository.save(book);
        issue = bookIssueRepository.save(issue);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", issue.getId());
        result.put("bookId", book.getId());
        result.put("bookTitle", book.getTitle());
        result.put("studentId", issue.getStudent().getId());
        result.put("studentName", issue.getStudent().getUser().getFirstName() + " " + issue.getStudent().getUser().getLastName());
        result.put("issueDate", issue.getIssueDate());
        result.put("dueDate", issue.getDueDate());
        result.put("returnDate", issue.getReturnDate());
        result.put("status", issue.getStatus());
        return result;
    }

    private Map<String, Object> issueToMap(BookIssue issue) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", issue.getId());
        map.put("bookId", issue.getBook().getId());
        map.put("bookTitle", issue.getBook().getTitle());
        map.put("studentId", issue.getStudent().getId());
        map.put("studentName", issue.getStudent().getUser().getFirstName() + " " + issue.getStudent().getUser().getLastName());
        map.put("issueDate", issue.getIssueDate().toString());
        map.put("dueDate", issue.getDueDate().toString());
        map.put("returnDate", issue.getReturnDate() != null ? issue.getReturnDate().toString() : null);
        map.put("status", issue.getStatus().toLowerCase());
        map.put("fine", issue.getFineAmount());
        return map;
    }

    private BookResponse toResponse(LibraryBook book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .publisher(book.getPublisher())
                .quantity(book.getQuantity())
                .availableCopies(book.getAvailable())
                .category(book.getCategory())
                .isActive(book.getIsActive() != null && book.getIsActive())
                .build();
    }
}
