RPG v0.46o - GitHub配置メモ

このフォルダ内の構成を崩さず、GitHubリポジトリの公開先へ配置してください。

index.html
css/style.css
js/game.js
assets/characters/*.webp
assets/npcs/*.webp
assets/backgrounds/*.webp

重要:
・index.html / css / js / assets の相対位置を変えないでください。
・通常のアップデートでは、変更されたファイルだけ上書きすればOKです。
・新しい画像が追加された場合は、その画像ファイルも対応するassetsフォルダへ追加します。
・v0.46oはv0.46nからゲーム内容を変更せず、外部ファイル化のみ行った版です。

ChatGPTの新規チャットへ引き継ぐ場合の基本セット:
・index.html
・css/style.css
・js/game.js
・handover_v0.46o.txt

画像の中身を確認・修正する作業が必要なときだけ、該当するassets画像も追加してください。
