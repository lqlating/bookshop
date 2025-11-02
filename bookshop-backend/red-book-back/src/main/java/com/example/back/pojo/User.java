package com.example.back.pojo;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String username;
    private String password;
    // 不再需要avatar字段存储BLOB数据，因为我们现在使用avatar_base64存储图片URL
    // private byte[] avatar;        // 存储 BLOB 数据
    private String avatar_base64; // 修改为直接存储图片URL
    private String email;
    private Integer id;
    private String gender;
    private String introduction;
    private String subscript;
    private String fans = "0";    // 设置初始值为0
    private  String account;
    // 新增字段
    private LocalDateTime ban_until = null;  // 设置初始值为null
    private Integer is_banned = 0;           // 设置初始值为0

    // 手动添加 setter 和 getter 方法
    public void setIsBanned(Integer is_banned) {
        this.is_banned = is_banned;
    }

    public Integer getIsBanned() {
        return is_banned;
    }

    public void setBanUntil(LocalDateTime ban_until) {
        this.ban_until = ban_until;
    }

    public LocalDateTime getBanUntil() {
        return ban_until;
    }
}