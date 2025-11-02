package com.example.back.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleLite {
    private Integer article_id;
    private Integer author_id;
    private String title;
    private String img_url;
    private Integer like_count;
    
    // 不再需要img字段，因为我们现在使用img_url存储图片链接
    // private byte[] img;
}