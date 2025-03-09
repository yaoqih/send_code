# Roboto字体本地文件

为了使网站在中国环境下正常运行，需要下载以下Roboto字体文件并放置在此目录中：

1. roboto-regular.woff2 - Roboto 400 (Regular)字重
2. roboto-medium.woff2 - Roboto 500 (Medium)字重
3. roboto-bold.woff2 - Roboto 700 (Bold)字重

## 获取字体文件的方法

### 方法1：从国内CDN下载

您可以从以下国内CDN下载Roboto字体：

- [字节跳动静态资源库](https://cdn.bytedance.com/)
- [七牛云](https://www.qiniu.com/)
- [阿里云OSS](https://www.aliyun.com/product/oss)

### 方法2：从Google Fonts下载并转换

如果您能访问Google Fonts，可以按照以下步骤操作：

1. 访问 https://fonts.google.com/specimen/Roboto
2. 下载字体包
3. 使用工具如[Font Squirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)将TTF文件转换为WOFF2格式
4. 将生成的WOFF2文件放置在此目录中

### 方法3：使用系统自带字体

如果无法获取Roboto字体，可以修改`roboto.css`文件，使用系统自带的字体作为替代：

```css
/* 使用系统字体替代Roboto */
@font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    src: local('PingFang SC'), local('Microsoft YaHei'), local('SimHei');
}

@font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 500;
    src: local('PingFang SC'), local('Microsoft YaHei'), local('SimHei');
}

@font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    src: local('PingFang SC Bold'), local('Microsoft YaHei Bold'), local('SimHei');
}
``` 