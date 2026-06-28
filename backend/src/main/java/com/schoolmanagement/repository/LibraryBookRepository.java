package com.schoolmanagement.repository;

import com.schoolmanagement.entity.LibraryBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LibraryBookRepository extends JpaRepository<LibraryBook, Long> {

    List<LibraryBook> findByIsActiveTrue();

    Optional<LibraryBook> findByIsbn(String isbn);

    List<LibraryBook> findByTitleContainingIgnoreCase(String title);

    List<LibraryBook> findByAuthorContainingIgnoreCase(String author);
}
