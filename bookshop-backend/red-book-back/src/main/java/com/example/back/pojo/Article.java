package com.example.back.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Article {
    private String img_url;
    private String txt_type;
    private Integer author_id;
    private String content;
    private String title;

    private Integer article_id;
    private String publication_time;
    private String address;
    private Integer star_count;
    private Integer like_count;

    // 不再需要img字段，因为我们现在使用img_url存储图片链接
    // private byte[] img;

    // 新增字段
    private Integer is_review;
    private Integer is_banned;
    
    /**
     * 创建一个只包含必要字段的精简版Article对象
     * @return 精简版Article对象
     */
    public Article toLiteVersion() {
        Article liteArticle = new Article();
        liteArticle.setArticle_id(this.article_id); // 保留文章ID
        liteArticle.setAuthor_id(this.author_id);
        liteArticle.setTitle(this.title);
        liteArticle.setImg_url(this.img_url);  // 直接使用图片URL
        liteArticle.setLike_count(this.like_count); // 保留点赞数
        // 确保其他字段为null
        liteArticle.setTxt_type(null);
        liteArticle.setContent(null);
        liteArticle.setPublication_time(null);
        liteArticle.setAddress(null);
        liteArticle.setStar_count(null);
        // liteArticle.setImg(null); 不再需要此字段
        liteArticle.setIs_review(null);
        liteArticle.setIs_banned(null);
        return liteArticle;
    }
}