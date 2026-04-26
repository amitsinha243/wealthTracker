package com.wealthtracker.controller;

import com.wealthtracker.model.ExpenseBook;
import com.wealthtracker.model.ExpenseBookExpense;
import com.wealthtracker.model.Notification;
import com.wealthtracker.model.User;
import com.wealthtracker.repository.ExpenseBookRepository;
import com.wealthtracker.repository.ExpenseBookExpenseRepository;
import com.wealthtracker.repository.NotificationRepository;
import com.wealthtracker.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expense-books")
public class ExpenseBookController {

    private final ExpenseBookRepository expenseBookRepository;
    private final ExpenseBookExpenseRepository expenseBookExpenseRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public ExpenseBookController(
            ExpenseBookRepository expenseBookRepository,
            ExpenseBookExpenseRepository expenseBookExpenseRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository) {
        this.expenseBookRepository = expenseBookRepository;
        this.expenseBookExpenseRepository = expenseBookExpenseRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // -------------------- Expense Book CRUD --------------------

    @GetMapping
    public ResponseEntity<List<ExpenseBook>> getAllExpenseBooks(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(expenseBookRepository.findByMemberUserIdsContaining(userId));
    }

    @PostMapping
    public ResponseEntity<ExpenseBook> createExpenseBook(@RequestBody ExpenseBook book, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        book.setCreatedBy(userId);
        book.setUpdatedAt(LocalDate.now());

        // Ensure creator is always a member
        if (!book.getMemberUserIds().contains(userId)) {
            book.getMemberUserIds().add(userId);
            book.getMemberEmails().add(creator.getEmail());
            book.getMemberNames().add(creator.getName());
        }

        ExpenseBook saved = expenseBookRepository.save(book);

        // Send notifications to all members except the creator
        for (String memberUserId : saved.getMemberUserIds()) {
            if (!memberUserId.equals(userId)) {
                createNotification(memberUserId, saved, creator.getName());
            }
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseBook> updateExpenseBook(
            @PathVariable String id, @RequestBody ExpenseBook book, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        ExpenseBook existing = expenseBookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense book not found"));

        if (!existing.getCreatedBy().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        existing.setName(book.getName());
        existing.setDescription(book.getDescription());
        existing.setUpdatedAt(LocalDate.now());
        return ResponseEntity.ok(expenseBookRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpenseBook(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        ExpenseBook book = expenseBookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense book not found"));

        if (!book.getCreatedBy().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        // Delete all expenses associated with this book
        List<ExpenseBookExpense> expenses = expenseBookExpenseRepository
                .findByExpenseBookIdOrderByExpenseDateDesc(id);
        expenseBookExpenseRepository.deleteAll(expenses);

        expenseBookRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // -------------------- Member Management --------------------

    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(
            @PathVariable String id, @RequestBody Map<String, String> body, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        ExpenseBook book = expenseBookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense book not found"));

        if (!book.getCreatedBy().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Only the creator can add members"));
        }

        String memberEmail = body.get("email");
        User memberUser = userRepository.findByEmail(memberEmail)
                .orElse(null);

        if (memberUser == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found with email: " + memberEmail));
        }

        if (book.getMemberUserIds().contains(memberUser.getId())) {
            return ResponseEntity.badRequest().body(Map.of("message", "User is already a member"));
        }

        book.getMemberUserIds().add(memberUser.getId());
        book.getMemberEmails().add(memberUser.getEmail());
        book.getMemberNames().add(memberUser.getName());
        book.setUpdatedAt(LocalDate.now());
        expenseBookRepository.save(book);

        // Send notification to the new member
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Creator not found"));
        createNotification(memberUser.getId(), book, creator.getName());

        return ResponseEntity.ok(book);
    }

    @DeleteMapping("/{id}/members/{memberUserId}")
    public ResponseEntity<?> removeMember(
            @PathVariable String id, @PathVariable String memberUserId, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        ExpenseBook book = expenseBookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense book not found"));

        if (!book.getCreatedBy().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "Only the creator can remove members"));
        }

        if (memberUserId.equals(userId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Creator cannot be removed"));
        }

        int index = book.getMemberUserIds().indexOf(memberUserId);
        if (index >= 0) {
            book.getMemberUserIds().remove(index);
            if (index < book.getMemberEmails().size()) book.getMemberEmails().remove(index);
            if (index < book.getMemberNames().size()) book.getMemberNames().remove(index);
            book.setUpdatedAt(LocalDate.now());
            expenseBookRepository.save(book);
        }

        return ResponseEntity.ok(book);
    }

    // -------------------- Expense CRUD --------------------

    @GetMapping("/{bookId}/expenses")
    public ResponseEntity<?> getExpenses(@PathVariable String bookId, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        ExpenseBook book = expenseBookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Expense book not found"));

        if (!book.getMemberUserIds().contains(userId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                expenseBookExpenseRepository.findByExpenseBookIdOrderByExpenseDateDesc(bookId));
    }

    @PostMapping("/{bookId}/expenses")
    public ResponseEntity<?> addExpense(
            @PathVariable String bookId, @RequestBody ExpenseBookExpense expense, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        ExpenseBook book = expenseBookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Expense book not found"));

        if (!book.getMemberUserIds().contains(userId)) {
            return ResponseEntity.status(403).build();
        }

        expense.setExpenseBookId(bookId);
        expense.setAddedByUserId(userId);
        expense.setUpdatedAt(LocalDate.now());
        return ResponseEntity.ok(expenseBookExpenseRepository.save(expense));
    }

    @PutMapping("/{bookId}/expenses/{expenseId}")
    public ResponseEntity<?> updateExpense(
            @PathVariable String bookId, @PathVariable String expenseId,
            @RequestBody ExpenseBookExpense expense, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        ExpenseBook book = expenseBookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Expense book not found"));

        if (!book.getMemberUserIds().contains(userId)) {
            return ResponseEntity.status(403).build();
        }

        ExpenseBookExpense existing = expenseBookExpenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!existing.getExpenseBookId().equals(bookId)) {
            return ResponseEntity.status(403).build();
        }

        expense.setId(expenseId);
        expense.setExpenseBookId(bookId);
        expense.setAddedByUserId(existing.getAddedByUserId());
        expense.setCreatedAt(existing.getCreatedAt());
        expense.setUpdatedAt(LocalDate.now());
        return ResponseEntity.ok(expenseBookExpenseRepository.save(expense));
    }

    @DeleteMapping("/{bookId}/expenses/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable String bookId, @PathVariable String expenseId, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        ExpenseBook book = expenseBookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Expense book not found"));

        if (!book.getMemberUserIds().contains(userId)) {
            return ResponseEntity.status(403).build();
        }

        ExpenseBookExpense expense = expenseBookExpenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getExpenseBookId().equals(bookId)) {
            return ResponseEntity.status(403).build();
        }

        expenseBookExpenseRepository.deleteById(expenseId);
        return ResponseEntity.ok().build();
    }

    // -------------------- Helper --------------------

    private void createNotification(String recipientUserId, ExpenseBook book, String creatorName) {
        Notification notification = new Notification();
        notification.setUserId(recipientUserId);
        notification.setType("EXPENSE_BOOK_ADDED");
        notification.setMessage(creatorName + " added you to expense book \"" + book.getName() + "\"");
        notification.setReferenceId(book.getId());
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }
}
