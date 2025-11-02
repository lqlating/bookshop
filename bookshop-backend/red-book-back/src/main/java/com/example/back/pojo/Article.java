package com.example.back.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Article {
    private String img_url;          // 对应数据库中的 img_url
    private String txt_type;         // 对应数据库中的 txt_type
    private Integer author_id;       // 对应数据库中的 author_id
    private String content;          // 对应数据库中的 content
    private String title;            // 对应数据库中的 title

    private Integer article_id;      // 对应数据库中的 article_id
    private String publication_time; // 对应数据库中的 publication_time
    private String address;          // 对应数据库中的 address
    private String star_count;       // 对应数据库中的 star_count (注意是String类型)
    private Integer like_count;      // 对应数据库中的 like_count

    private String img;              // 对应数据库中的 img 字段
    
    // 新增字段
    private Integer is_review;       // 对应数据库中的 is_review
    private Integer is_banned;       // 对应数据库中的 is_banned
    
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
        liteArticle.setImg(null);
        liteArticle.setIs_review(null);
        liteArticle.setIs_banned(null);
        return liteArticle;
    }
}