package com.example.back.pojo;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String username;     // 对应数据库中的 username
    private String password;     // 对应数据库中的 password
    private String avatar;       // 对应数据库中的 avatar
    private String email;        // 对应数据库中的 email
    private String account;      // 对应数据库中的 account
    private Integer subscript;   // 对应数据库中的 subscript
    private Integer fans;        // 对应数据库中的 fans
    private String introduction; // 对应数据库中的 introduction
    private String gender;       // 对应数据库中的 gender
    private Integer id;          // 对应数据库中的 id
    
    // 新增字段
    private LocalDateTime ban_until; // 对应数据库中的 ban_until
    private Integer is_banned;       // 对应数据库中的 is_banned
    
    // 数据库中没有的字段，但代码中存在默认值
    // private String fans = "0";
    // private LocalDateTime ban_until = null;
    // private Integer is_banned = 0;
    
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