/*
 * Copyright(c) 2015 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
package jp.co.ntt.atrs.api.ticket;

import java.util.List;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import jp.co.ntt.atrs.domain.service.b2.TicketReserveErrorCode;

/**
 * 予約フライト選択リソースのバリデータ。
 * <p>
 * 下記の場合をエラーとする。
 * </p>
 * <ul>
 * <li>フライトが正しく選択されていない場合。</li>
 * </ul>
 * @author NTT 電電次郎
 */
@Component
public class ReservationFlightValidator implements Validator {
    /**
     * {@inheritDoc}
     */
    @Override
    public boolean supports(Class<?> clazz) {
        return (TicketReserveResource.class).isAssignableFrom(clazz);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void validate(Object target, Errors errors) {
        TicketReserveResource resource = (TicketReserveResource) target;
        List<SelectFlightResource> selectFlightResourceList =
                resource.getSelectFlightResourceList();

        // フライト種別に応じてチェック
        if (!errors.hasFieldErrors("flightType")) {
            switch (resource.getFlightType()) {
                case RT:
                    // 往復の場合のチェック
                    validateRoundTrip(selectFlightResourceList, errors);
                    break;

                case OW:
                    // 片道の場合のチェック
                    validateOneWay(selectFlightResourceList, errors);
                    break;

                default:
                    // 処理なし

                    break;
            }
        }
    }

    /**
     * 往復の場合のチェックを行う。
     * @param selectFlightResourceList 予約フライト選択リソース
     * @param errors エラーメッセージを保持するクラス
     */
    private void validateRoundTrip(List<SelectFlightResource> selectFlightResourceList,
            Errors errors) {
        // 選択フライト必須チェック
        if (CollectionUtils.isEmpty(selectFlightResourceList)) {
            // 往路、復路共に未入力の場合
            errors.reject("NotNull.outwardFlight",
                    new Object[] {new DefaultMessageSourceResolvable("outwardFlight")}, "");
            errors.reject("NotNull.homewardFlight",
                    new Object[] {new DefaultMessageSourceResolvable("homewardFlight")}, "");
        } else {
            // フライトが2つ選択されていることをチェック
            if (selectFlightResourceList.size() == 2) {
                // OK
            } else if (selectFlightResourceList.size() == 1) {
                // 往路か復路のいずれかが未入力の場合
                errors.reject(TicketReserveErrorCode.E_AR_B2_5001.code());
            } else {
                // 往復で選択数が0-2以外は通常操作では設定されないケースであり、
                // 改ざんとみなす
                // 選択フライト情報にフィールドとしてエラー設定し、
                // 後続処理で不正リクエスト例外とする
                // Invalidは独自エラーコード(対応するメッセージ定義はない)
                errors.rejectValue("selectFlightResourceList", "Invalid");
            }
        }
    }

    /**
     * 片道の場合のチェックを行う。
     * @param selectFlightResourceList 予約フライト選択リソース
     * @param errors エラーメッセージを保持するクラス
     */
    private void validateOneWay(List<SelectFlightResource> selectFlightResourceList,
            Errors errors) {
        // 選択フライト必須チェック
        if (CollectionUtils.isEmpty(selectFlightResourceList)) {
            errors.reject("NotNull.outwardFlight",
                    new Object[] {new DefaultMessageSourceResolvable("outwardFlight")}, "");
        } else {
            // フライトが1つ選択されていることをチェック
            if (selectFlightResourceList.size() == 1) {
                // OK
            } else {
                // 片道で選択数が0-1以外は通常操作では設定されないケースであり、
                // 改ざんとみなす
                // 選択フライト情報にフィールドとしてエラー設定し、
                // 後続処理で不正リクエスト例外とする
                // Invalidは独自エラーコード(対応するメッセージ定義はない)
                errors.rejectValue("selectFlightResourceList", "Invalid");
            }
        }
    }

}
