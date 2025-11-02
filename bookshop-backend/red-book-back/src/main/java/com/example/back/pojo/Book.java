package com.example.back.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    private String book_img;        // 对应数据库中的 book_img
    private String book_seller_id;  // 对应数据库中的 book_seller_id
    private Integer book_price;     // 对应数据库中的 book_price
    private String book_writer;     // 对应数据库中的 book_writer
    private String book_title;      // 对应数据库中的 book_title
    private String book_type;       // 对应数据库中的 book_type
    private String book_descripe;   // 对应数据库中的 book_descripe

    private Integer is_review;      // 对应数据库中的 is_review
    private Integer is_banned;      // 对应数据库中的 is_banned
    private Integer book_id;        // 对应数据库中的 book_id
    
    // 数据库中还有 is_selled 字段，但实体类中没有对应字段
    // 如果需要可以添加 private Integer is_selled;
}