package com.example.back.service.impl;

import com.example.back.mapper.BookMapper;
import com.example.back.pojo.Book;
import com.example.back.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Base64;
import java.util.List;

@Service
public class BookServiceImpl implements BookService {

    @Autowired
    private BookMapper bookMapper;

    @Override
    public List<Book> listBooks() {
        return bookMapper.listBooks();
    }

    @Override
    public Book getBookById(Integer book_id) {
        return bookMapper.getBookById(book_id);
    }

    @Override
    public void addBook(Book book) {
        bookMapper.addBook(book);
    }

    @Override
    public void updateBook(Book book) {
        bookMapper.updateBook(book);
    }

    @Override
    public void deleteBook(Integer book_id) {
        bookMapper.deleteBook(book_id);
    }

    @Override
    public List<Book> getBooksByType(String book_type) {
        return bookMapper.getBooksByType(book_type);
    }

    // 新增方法实现
    @Override
    public List<Book> getBooksBySellerId(String book_seller_id) {
        return bookMapper.getBooksBySellerId(book_seller_id);
    }

    // 新增方法实现
    @Override
    public List<Book> getBooksByTitle(String title) { // 确保方法签名与接口一致
        List<Book> books = bookMapper.getBooksByTitle(title);
        // 直接传输原始数据，不进行Base64转换
        return books;
    }

    // 新增方法实现
    @Override
    public List<Book> getBooksByTitleContaining(String title) {
        List<Book> books = bookMapper.getBooksByTitleContaining(title);
        // 直接传输原始数据，不进行Base64转换
        return books;
    }

    // 新增方法：将指定书籍的 is_review 和 is_banned 设置为 1
    @Override
    public void setReviewedAndBanned(Integer book_id) {
        bookMapper.setReviewedAndBanned(book_id);
    }

    @Override
    public List<Book> getUnreviewedBooks() {
        List<Book> books = bookMapper.getUnreviewedBooks();
        // 直接传输原始数据，不进行Base64转换
        return books;
    }

    @Override
    public List<Book> getBannedBooks() {
        List<Book> books = bookMapper.getBannedBooks();
        // 直接传输原始数据，不进行Base64转换
        return books;
    }

    @Override
    public void unbanBook(Integer book_id) {
        bookMapper.unbanBook(book_id);
    }

    @Override
    public void setReviewed(Integer book_id) {
        bookMapper.setReviewed(book_id);
    }
}