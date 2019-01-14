<template lang="pug">
.page.page-about
    navbar
    .container.pt-5.pb-5
        .row
            .col-sm-9.pt-3
                h2 關於 Organism
                br
                p Organism是節點版本的文章編輯器，把內容拆成散落的片段進行組合跟寫作
                p 非線性寫作平台，用節點的方式寫作跟管理知識內容，避免文章很難一路寫到底的問題，把一些骨架跟靈感抓出來之後再湊起來。
                p 很適合拿來邊教材，讓一張圖輸出不同個文章結構樹，比如 圖裡面有ABCDE，你可以產生兩個文章連結給不同的社群 一個是ABE 一個是完整的ABCDE，給付費訂閱之類的使用，還有作者在看後台的時候，看得到section即時流動的讀者們
                img(src="/static/img/demo.png")
                div.mt-5.mb-3
                    h4 2019/1/10 v0.0.4
                    ol
                        li 加入節點標題、文章標題多行功能
                        li 加入簡易操作說明
                        li 加入上下節點取消連結功能
                        li 優化編輯介面 - 節點種類改為hover時顯示
                    h4 2019/1/10 v0.0.3
                    ol
                        li 調整刪除權限，僅能刪除非本人文章
                        li 將文章標題編輯欄位移動到預覽中
                        li 修正文章更新時間顯示錯誤問題
                        li 更新導覽列樣式
                        li 更新未填寫標題之區塊提示文字
                    h4 2019/1/6 v0.0.2
                    ol
                        li 修正無法正確刪除問題 
                        li 修正文章無標題時無法點進去
                        li 加上文章刪除、節點刪除提示
                        li 讓右側預覽文章也能即時編輯，並反應回節點
                        li 加上文章時間紀錄
                        li 新增畫面即時同步功能(socket.io)
                        li 新增自動即時儲存節點功能
                        li 修正整理後會跳回問題
                        li 修正右側編輯跳回問題
                        li 修正點擊取消連線崩潰問題
                        li 新增link
                        li 加上About
                        li 縮小每個節點跟微調版面

</template>

<script>
import navbar from '~/components/navbar'
export default {
    // transition: "page",
    components: {
        navbar
    },

}
</script>

<style>

</style>
