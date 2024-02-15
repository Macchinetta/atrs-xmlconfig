# atrs（macchinetta client用）

## 事前準備
### データベース構築
ローカル（localhost:5432）のPostgreSQLにデータベースを作成する。  

| Property   | Value    |
|:-----------|:---------|
| DB名       | atrs     |
| ユーザ     | postgres |
| パスワード | postgres |

### DB初期化
以下のコマンドを実行しDBを初期化する。  
`mvn sql:execute -pl atrs-initdb`

## JDK 8を使用する場合

### ビルド
以下のコマンドを実行しコンパイルする。

- atrs(JSP)をコンパイルする場合  
  `mvn clean install`

- atrs(Thymeleaf)をコンパイルする場合  
  以下のコマンドをatrs(JSP)のコンパイル後に追加で実行する。  
  `mvn clean install -f atrs-web-thymeleaf/pom.xml`

### アプリケーションの起動
#### Tomcatの起動
- atrs(JSP)を起動する場合  
  `mvn cargo:run -pl atrs-web`

- atrs(Thymeleaf)を起動する場合  
  `mvn cargo:run -f atrs-web-thymeleaf/pom.xml`

#### アクセス
以下のURLにアクセスする。

http://localhost:8080/atrs/

## JDK 11/JDK 17を使用する場合
JDK 11/JDK 17を使用する場合は、デフォルトプロファイルの指定がJDK 8使用時と異なるため、追加でプロファイルを指定する必要がある。

### ビルド
以下のコマンドを実行しコンパイルする。

- atrs(JSP)をコンパイルする場合  
  `mvn clean install -P default`

- atrs(Thymeleaf)をコンパイルする場合  
  以下のコマンドをatrs(JSP)のコンパイル後に追加で実行する。  
  `mvn clean install -P default -f atrs-web-thymeleaf/pom.xml`

### アプリケーションの起動
#### Tomcatの起動
- atrs(JSP)を起動する場合  
  `mvn cargo:run -P default -pl atrs-web`

- atrs(Thymeleaf)を起動する場合  
  `mvn cargo:run -P default -f atrs-web-thymeleaf/pom.xml`

#### アクセス
以下のURLにアクセスする。

http://localhost:8080/atrs/