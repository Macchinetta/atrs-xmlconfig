/*
 * Copyright(c) 2015 NTT Corporation.
 */
package jp.co.ntt.atrs.app.common.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * アクセスログを出力するフィルタ。
 * 
 * @author NTT 電電太郎
 */
public class AccessLogFilter extends OncePerRequestFilter {

    /**
     * ロガー。
     */
    private static final Logger LOGGER =
        LoggerFactory.getLogger(AccessLogFilter.class);

    /**
     * {@inheritDoc}
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
        HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

        String logMessage = getLogMessage(request);
        LOGGER.info("ACCESS START {}", logMessage);
        filterChain.doFilter(request, response);
        LOGGER.info("ACCESS FINISH {}", logMessage);
    }

    /**
     * ログメッセージを取得する。
     * 
     * @param request リクエスト
     * @return ログメッセージ
     */
    private String getLogMessage(HttpServletRequest request) {

        StringBuilder sb = new StringBuilder();

        sb.append("[RequestURL:").append(request.getRequestURL().toString());
        String queryString = request.getQueryString();
        if (queryString != null) {
            sb.append("?").append(queryString);
        }
        sb.append("], ");

        HttpSession session = request.getSession(false);
        if (session != null) {
            sb.append("[SessionID:").append(session.getId()).append("], ");
        }

        sb.append("[RemoteAddress:").append(request.getRemoteAddr()).append("], ");
        sb.append("[RemoteHost:").append(request.getRemoteHost()).append("] ");

        return sb.toString();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {

        String uri = request.getRequestURI();
        if (uri.startsWith(request.getContextPath() + "/resources/")) {
            return true;
        }

        return false;
    }
}