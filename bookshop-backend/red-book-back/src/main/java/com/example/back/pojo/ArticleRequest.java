package com.example.back.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleRequest {
    // 已废弃的字段
    @Deprecated
    private String img;
    @Deprecated
    private byte[] imgData;
    
    private String imgUrl;
    private String txtType;
    private Integer authorId;
    private String content;
    private String title;

    // 自动生成的
    private Integer likeCount;
    private Integer starCount;
    private String publicationTime;
    private String address;

    // 新增字段
    private Integer isReview;
    private Integer isBanned;
}