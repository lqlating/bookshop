package com.example.back.mapper;

import com.example.back.pojo.Book;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BookMapper {

    List<Book> listBooks();

    Book getBookById(Integer bookId);

    void addBook(Book book);

    void updateBook(Book book);

    void deleteBook(Integer bookId);

    List<Book> getBooksByType(@Param("book_type") String book_type);

    // 新增方法
    List<Book> getBooksBySellerId(@Param("book_seller_id") String book_seller_id);

    // 新增方法
    List<Book> getBooksByTitle(@Param("title") String title);

    // 新增方法
    List<Book> getBooksByTitleContaining(@Param("title") String title);

    // 新增方法：将指定书籍的 is_review 和 is_banned 设置为 1
    void setReviewedAndBanned(@Param("book_id") Integer book_id);

    // 新增方法：获取所有待审核的书籍（is_review = 0）
    List<Book> getUnreviewedBooks();

    // 新增方法：获取所有被禁止的书籍（is_banned = 1）
    List<Book> getBannedBooks();

    // 如果有其他使用@Select注解的方法，也需要添加条件
    List<Book> searchBooksByTitle(@Param("title") String title);

    // 新增方法：将指定书籍的 is_banned 设置为 0（解禁）
    void unbanBook(@Param("book_id") Integer book_id);

    // 新增方法：将指定书籍的 is_review 设置为 1（标记为已审核）
    void setReviewed(@Param("book_id") Integer book_id);
}