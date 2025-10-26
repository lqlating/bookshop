package com.example.back.service.impl;

import com.example.back.mapper.ArticleMapper;
import com.example.back.pojo.Article;
import com.example.back.pojo.ArticleRequest;
import com.example.back.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;

@Service
public class ArticleServiceImpl implements ArticleService {
    @Autowired
    private ArticleMapper articleMapper;

    @Override
    public List<Article> list(String type, Integer page, Integer size) {
        long startTime = System.currentTimeMillis(); // 记录开始时间

        // 1️⃣ 数据库查询阶段
        List<Article> articles = articleMapper.list(type, (page - 1) * size, size);
        long dbTime = System.currentTimeMillis();
        System.out.println("[DEBUG] DB 查询耗时：" + (dbTime - startTime) + " ms");

        // 2️⃣ Base64 转换阶段（如果有图片）
        for (Article article : articles) {
            if (article.getImg() != null) {
                String base64Image = Base64.getEncoder().encodeToString(article.getImg());
                article.setImg_url(base64Image);
            }
        }
        long encodeTime = System.currentTimeMillis();
        System.out.println("[DEBUG] Base64 转换耗时：" + (encodeTime - dbTime) + " ms");

        // 3️⃣ 总耗时
        System.out.println("[DEBUG] 总耗时：" + (encodeTime - startTime) + " ms");

        return articles;
    }

    @Override
    public List<Article> listExcludeAuthor(String type, Integer id, Integer page, Integer size) {
        return articleMapper.listExcludeAuthor(type, id, (page - 1) * size, size);
    }

    @Override
    public void addLike(Integer articleId) {
        articleMapper.addLike(articleId);
    }

    @Override
    public void subLike(Integer articleID) {
        articleMapper.subLike(articleID);
    }

    @Override
    public void addStar(Integer articleID) {
        articleMapper.addStar(articleID);
    }

    @Override
    public void subStar(Integer articleID) {
        articleMapper.subStar(articleID);
    }

    @Override
    public List<Article> getArticlesByIds(List<Integer> articleIds) {
        return articleMapper.selectArticlesByIds(articleIds);
    }

    @Override
    public List<Article> searchByTitleOrContent(String keyword, Integer page, Integer size) {
        return articleMapper.searchByTitleOrContent(keyword, (page - 1) * size, size);
    }

    @Override
    public List<Article> searchByTitleOrContentExcludeAuthor(String keyword, Integer id, Integer page, Integer size) {
        return articleMapper.searchByTitleOrContentExcludeAuthor(keyword, id, (page - 1) * size, size);
    }

    @Override
    public List<Article> searchByTitleOrContentWithFilter(String keyword, Integer excludeAuthorId) {
        return articleMapper.searchByTitleOrContentWithFilter(keyword, excludeAuthorId);
    }

    @Override
    public List<Article> getArticlesByAuthorId(Integer authorId, Integer page, Integer size) {
        return articleMapper.findArticlesByAuthorId(authorId, (page - 1) * size, size);
    }

    @Override
    public List<Article> getUnreviewedArticles(Integer page, Integer size) {
        return articleMapper.getUnreviewedArticles((page - 1) * size, size);
    }

    @Override
    public void save(ArticleRequest article) {
        articleMapper.insert(article);
    }

    @Override
    public List<Article> getBannedArticles(Integer page, Integer size) {
        return articleMapper.getBannedArticles((page - 1) * size, size);
    }

    @Override
    public void setReviewedAndBanned(Integer articleId) {
        articleMapper.setReviewedAndBanned(articleId);
    }

    @Override
    public Object getArticleById(Integer id) {
        return articleMapper.getArticleById(id);
    }

    @Override
    public void setReviewed(Integer articleId) {
        articleMapper.setReviewed(articleId);
    }

    @Override
    public void unbanArticle(Integer articleId) {
        articleMapper.unbanArticle(articleId);
    }

    @Override
    public void deleteArticle(Integer article_id) {
        articleMapper.deleteArticle(article_id);
    }
}
