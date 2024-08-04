// server.js

// deno.landに公開されているモジュールをimport
// denoではURLを直に記載してimportできます
import { serveDir } from "https://deno.land/std@0.223.0/http/file_server.ts";

let previousWord = "aiout";
let wordHistories = ["aiout"];

// localhostにDenoのHTTPサーバーを展開
Deno.serve(async(request) => {
// パス名を取得する
     // http://localhost:8000/hoge に接続した場合"/hoge"が取得できる
    const pathname = new URL(request.url).pathname;
    console.log(`pathname: ${pathname}`);

    // GET /shiritori: 直前の単語を返す
    if (request.method === "GET" && pathname === "/shiritori") {
        return new Response(previousWord);
    }

    // POST /shiritori: 次の単語を入力する
    if(request.method ==="POST" && pathname === "/shiritori" ){
        // リクエストのペイロードを取得
        const requestJson = await request.json();
        // JSONの中からnextWordを取得
        const nextWord = requestJson["nextWord"];

        console.log(previousWord);
        console.log(nextWord);

        // previousWordの末尾とnextWordの先頭が同一か確認
        if(previousWord.slice(-1) === nextWord.slice(0,1)){
            //末尾がんだったら
            if(nextWord.slice(-1) ==='n'){
                return new Response(
                    JSON.stringify({
                        "errorMessage": "「ん」で終わっています\nゲームを終了します",
                        "errorCode": "10002"
                    }),
                    {
                        status: 400,
                        headers: {"Content-Type": "application/json; charset=udf-8"}
                    }
                )
            }
            //すでに使われていたら
            if(wordHistories.includes(nextWord)){
                return new Response(
                    JSON.stringify({
                        "errorMessage": "すでに使われています",
                        "errorCode": "10003"
                    }),
                    {
                        status: 400,
                        headers: {"Content-Type": "application/json; charset=udf-8"}
                    }
                )
            }
            //一文字だったら
            if(nextWord.length === 1){
                return new Response(
                    JSON.stringify({
                        "errorMessage": "一文字の単語は無効です",
                        "errorCode": "10004"
                    }),
                    {
                        status: 400,
                        headers: {"Content-Type": "application/json; charset=udf-8"}
                    }
                )
            }
            //console.log(String.fromCharCode(nextWord)); 
            // 同一であれば、previousWordを更新
            wordHistories.push(nextWord);
            previousWord = nextWord;
        }
        else{
            return new Response(
                JSON.stringify({
                    "errorMessage": "前の単語に続いていません",
                    "errorCode": "10001"
                }),
                {
                    status: 400,
                    headers: {"Content-Type": "application/json; charset=udf-8"}
                }
            )
        }

        return new Response(previousWord);
    }

    //POST /reset:リセット
    //request.methodとpathnameを確認
    if(request.method ==="POST" && pathname === "/reset"){
        // リクエストのペイロードを取得
        const requestJson = await request.json();
        // JSONの中からnextWordを取得
        const nextWord = requestJson["nextWord"];
        wordHistories=[];
        previousWord = nextWord;
    }

    //POST /show:表示
    // deno-lint-ignore no-empty
    if(request.method ==="POST" && pathname === "/show"){
        
    }


    return serveDir(
        request,
        {
            /*
            - fsRoot: 公開するフォルダを指定
            - urlRoot: フォルダを展開するURLを指定。今回はlocalhost:8000/に直に展開する
            - enableCors: CORSの設定を付加するか
             */
            fsRoot: "./public/",
            urlRoot: "",
            enableCors: true,
        }
    )
});