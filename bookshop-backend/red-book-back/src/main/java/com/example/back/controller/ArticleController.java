package com.example.back.controller;

import com.example.back.pojo.Article;
import com.example.back.pojo.ArticleRequest;
import com.example.back.pojo.Result;
import com.example.back.service.ArticleService;
import com.example.back.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@RestController
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    @Autowired
    private ReportService reportService;

    @Operation(summary = "Filter content based on type", description = "Returns a list of articles filtered by type, is_review = 1, and is_banned = 0")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Articles retrieved successfully",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Article.class)) }),
            @ApiResponse(responseCode = "404", description = "Articles not found",
                    content = @Content)
    })
    @GetMapping("/FilterContent/{type}")
    public Result list(@PathVariable String type,
                       @RequestParam Integer page,
                       @RequestParam Integer size) {
        List<Article> articleList = articleService.list(type, page, size);
        // 对于每篇文章，处理图片URL
        for (Article article : articleList) {
            if (article.getImg() != null) {
                // img字段已经是URL，直接设置到img_url字段
                article.setImg_url(article.getImg());
                article.setImg(null);  // 清空原始img数据，避免重复返回
            }
        }

        return Result.success(articleList);  // 返回带有图片URL的文章列表
    }

    @Operation(summary = "Filter content based on type excluding an author", description = "Returns a list of articles filtered by type, is_review = 1, is_banned = 0, and author_id not equal to the specified id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Articles retrieved successfully",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Article.class)) }),
            @ApiResponse(responseCode = "404", description = "Articles not found",
                    content = @Content)
    })
    @GetMapping("/FilterContent/{type}/{id}")
    public Result listExcludeAuthor(@PathVariable String type, @PathVariable Integer id,
                                    @RequestParam Integer page,
                                    @RequestParam Integer size) {
        List<Article> articleList = articleService.listExcludeAuthor(type, id, page, size);
        // 对于每篇文章，处理图片URL
        for (Article article : articleList) {
            if (article.getImg() != null) {
                // img字段已经是URL，直接设置到img_url字段
                article.setImg_url(article.getImg());
                article.setImg(null);  // 清空原始img数据，避免重复返回
            }
        }

        return Result.success(articleList);  // 返回带有图片URL的文章列表
    }

    @Operation(summary = "Add like to an article", description = "Increases the like count for the specified article")
    @PostMapping("/addLike/{articleID}")
    public void addLike(@PathVariable Integer articleID) {
        articleService.addLike(articleID);
    }

    @Operation(summary = "Remove like from an article", description = "Decreases the like count for the specified article")
    @PostMapping("/subLike/{articleID}")
    public void subLike(@PathVariable Integer articleID) {
        articleService.subLike(articleID);
    }

    @Operation(summary = "Add star to an article", description = "Increases the star count for the specified article")
    @PostMapping("/addStar/{articleID}")
    public void addStar(@PathVariable Integer articleID) {
        articleService.addStar(articleID);
    }

    @Operation(summary = "Remove star from an article", description = "Decreases the star count for the specified article")
    @PostMapping("/subStar/{articleID}")
    public void subStar(@PathVariable Integer articleID) {
        articleService.subStar(articleID);
    }

    @PostMapping("/getArticlesByIds")
    public Result getArticlesByIds(@RequestBody List<Integer> articleIds) {
        List<Article> articles = articleService.getArticlesByIds(articleIds);

        // 处理图片URL
        for (Article article : articles) {
            if (article.getImg() != null) {
                // img字段已经是URL，直接设置到img_url字段
                article.setImg_url(article.getImg());
                article.setImg(null);  // 清空原始img数据，避免重复返回
            }
        }

        if (!articles.isEmpty()) {
            return Result.success(articles);  // 返回带有图片URL的文章列表
        } else {
            return Result.error("Articles not found");
        }
    }

    @Operation(summary = "Search articles by title or content", description = "Searches for articles whose title or content contains the specified keyword")
    @GetMapping("/SearchArticle")
    public Result searchByTitleOrContent(@RequestParam String keyword,
                                         @RequestParam Integer page,
                                         @RequestParam Integer size) {
        List<Article> articles = articleService.searchByTitleOrContent(keyword, page, size);

        // 处理图片URL
        for (Article article : articles) {
            if (article.getImg() != null) {
                // img字段已经是URL，直接设置到img_url字段
                article.setImg_url(article.getImg());
                article.setImg(null);
            }
        }

        return Result.success(articles);  // 返回带有图片URL的文章列表
    }

    @Operation(summary = "Search articles by title or content excluding an author", description = "Searches for articles whose title or content contains the specified keyword and author_id not equal to the specified id")
    @GetMapping("/SearchArticle/{id}")
    public Result searchByTitleOrContentExcludeAuthor(@RequestParam String keyword, @PathVariable Integer id,
                                                      @RequestParam Integer page,
                                                      @RequestParam Integer size) {
        List<Article> articles = articleService.searchByTitleOrContentExcludeAuthor(keyword, id, page, size);

        // 处理图片URL
        for (Article article : articles) {
            if (article.getImg() != null) {
                // img字段已经是URL，直接设置到img_url字段
                article.setImg_url(article.getImg());
                article.setImg(null);
            }
        }

        return Result.success(articles);  // 返回带有图片URL的文章列表
    }

    @GetMapping("/getArticlesByAuthorId/{authorId}")
    public Result getArticlesByAuthorId(@PathVariable Integer authorId,
                                        @RequestParam Integer page,
                                        @RequestParam Integer size) {
        List<Article> articles = articleService.getArticlesByAuthorId(authorId, page, size);

        // 直接传输原数据，不进行Base64转换
        if (!articles.isEmpty()) {
            return Result.success(articles);
        } else {
            return Result.error("Articles not found");
        }
    }

    @Operation(summary = "Add a new article", description = "Inserts a new article into the database")
    @PostMapping(value = "/addArticle", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result addArticle(@RequestParam("title") String title,
                             @RequestParam("content") String content,
                             @RequestParam("txtType") String txtType,
                             @RequestParam("authorId") Integer authorId,
                             @RequestParam(value = "img", required = false) MultipartFile file) {
        try {
            String imgUrl = null;
            if (file != null && !file.isEmpty()) {
                // 保存图片到服务器指定目录
                String filename = "article_" + UUID.randomUUID() + "_" + System.currentTimeMillis() + ".jpg";
                String uploadDir = "/var/www/img/article/";
                Path path = Paths.get(uploadDir + filename);
                Files.write(path, file.getBytes());
                imgUrl = "/img/article/" + filename;
            }

            // 创建 ArticleRequest 对象并设置属性
            ArticleRequest articleRequest = new ArticleRequest();
            articleRequest.setTitle(title);
            articleRequest.setContent(content);
            articleRequest.setTxtType(txtType);
            articleRequest.setAuthorId(authorId);
            articleRequest.setImgUrl(imgUrl); // 设置图片URL路径

            // 设置默认值
            articleRequest.setLikeCount(0);
            articleRequest.setStarCount(0);
            articleRequest.setPublicationTime(LocalDate.now().toString()); // 获取当前日期
            articleRequest.setAddress(getRandomAddress()); // 获取随机地址
            articleRequest.setIsReview(0); // 设置 isReview 默认值为 0
            articleRequest.setIsBanned(0); // 设置 isBanned 默认值为 0

            articleService.save(articleRequest);
            return Result.success("Article added successfully");
        } catch (IOException e) {
            e.printStackTrace();
            return Result.error("上传失败：" + e.getMessage());
        }
    }

    private String getRandomAddress() {
        String[] provinces = {"北京", "上海", "广东", "江苏", "浙江", "四川", "陕西", "山东", "湖北", "湖南"};
        Random random = new Random();
        return provinces[random.nextInt(provinces.length)];
    }

    // 新增接口：获取所有 is_review 为 0 的文章数据
    @Operation(summary = "Get all unreviewed articles", description = "Returns a list of articles with is_review = 0")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Unreviewed articles retrieved successfully",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Article.class)) }),
            @ApiResponse(responseCode = "404", description = "Unreviewed articles not found",
                    content = @Content)
    })
    @GetMapping("/getUnreviewedArticles")
    public Result getUnreviewedArticles(@RequestParam Integer page,
                                        @RequestParam Integer size) {
        List<Article> unreviewedArticles = articleService.getUnreviewedArticles(page, size);

        // 处理图片URL
        for (Article article : unreviewedArticles) {
            if (article.getImg() != null) {
                // img字段已经是URL，直接设置到img_url字段
                article.setImg_url(article.getImg());
                article.setImg(null);  // 清空原始img数据，避免重复返回
            }
        }

        if (!unreviewedArticles.isEmpty()) {
            return Result.success(unreviewedArticles);  // 返回带有图片URL的文章列表
        } else {
            return Result.error("Unreviewed articles not found");
        }
    }

    // 新增接口：获取所有 is_banned 为 1 的文章数据
    @Operation(summary = "Get all banned articles", description = "Returns a list of articles with is_banned = 1")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Banned articles retrieved successfully",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Article.class)) }),
            @ApiResponse(responseCode = "404", description = "Banned articles not found",
                    content = @Content)
    })
    @GetMapping("/getBannedArticles")
    public Result getBannedArticles(@RequestParam Integer page,
                                    @RequestParam Integer size) {
        List<Article> bannedArticles = articleService.getBannedArticles(page, size);

        // 处理图片URL
        for (Article article : bannedArticles) {
            if (article.getImg() != null) {
                // img字段已经是URL，直接设置到img_url字段
                article.setImg_url(article.getImg());
                article.setImg(null);  // 清空原始img数据，避免重复返回
            }
        }

        if (!bannedArticles.isEmpty()) {
            return Result.success(bannedArticles);  // 返回带有图片URL的文章列表
        } else {
            return Result.error("Banned articles not found");
        }
    }

    // 新增接口：将指定文章的 is_review 和 is_banned 设置为 1
    @Operation(summary = "Set article as reviewed and banned", description = "Sets the is_review and is_banned fields of the specified article to 1")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Article updated successfully",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Article.class)) }),
            @ApiResponse(responseCode = "404", description = "Article not found",
                    content = @Content)
    })
    @PutMapping("/setReviewedAndBanned/{articleId}")
    public Result setReviewedAndBanned(@PathVariable Integer articleId) {
        articleService.setReviewedAndBanned(articleId);
        return Result.success("Article set as reviewed and banned successfully");
    }

    @Operation(summary = "Set article as reviewed", description = "Sets the is_review field of the specified article to 1")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Article marked as reviewed successfully",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Article.class)) }),
            @ApiResponse(responseCode = "404", description = "Article not found",
                    content = @Content)
    })
    @PutMapping("/setReviewed/{articleId}")
    public Result setReviewed(@PathVariable Integer articleId) {
        articleService.setReviewed(articleId);
        return Result.success("Article marked as reviewed successfully");
    }

    // 新增接口：将指定文章的 is_banned 设置为 0（解封文章）
    @Operation(summary = "Unban an article", description = "Sets the is_banned field of the specified article to 0 and removes related reports")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Article unbanned successfully",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Article.class)) }),
            @ApiResponse(responseCode = "404", description = "Article not found",
                    content = @Content)
    })
    @PutMapping("/unbanArticle/{articleId}")
    public Result unbanArticle(@PathVariable Integer articleId) {
        try {
            // 1. 解封文章
            articleService.unbanArticle(articleId);
            
            // 确保文章已被审核 (is_review = 1)
            articleService.setReviewed(articleId);
            
            // 2. 从report表中删除相关举报数据
            reportService.deleteReportByContentTypeAndId("article", articleId);
            
            return Result.success("Article unbanned successfully and related reports deleted");
        } catch (Exception e) {
            return Result.error("Failed to unban article: " + e.getMessage());
        }
    }

    @Operation(summary = "Delete an article", description = "Deletes an article with the specified ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Article deleted successfully",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Result.class)) }),
            @ApiResponse(responseCode = "404", description = "Article not found",
                    content = @Content)
    })
    @DeleteMapping("/deleteArticle/{article_id}")
    public Result deleteArticle(@PathVariable Integer article_id) {
        try {
            articleService.deleteArticle(article_id);
            return Result.success("Article deleted successfully");
        } catch (Exception e) {
            return Result.error("Failed to delete article: " + e.getMessage());
        }
    }
}
