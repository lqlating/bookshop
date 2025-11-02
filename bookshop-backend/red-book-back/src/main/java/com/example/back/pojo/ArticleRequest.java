package com.example.back.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleRequest {
    // 不再使用img字段存储Base64编码的图片
    // private String img;
    
    // 使用imgUrl字段存储图片链接
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
    // 不再需要imgData字段存储图片二进制数据
    // private byte[] imgData;

    // 新增字段
    private Integer isReview;
    private Integer isBanned;
}