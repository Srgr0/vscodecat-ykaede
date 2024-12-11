const vscode = require('vscode');

function activate(context) {
    // パネルのインスタンスを保持
    let currentPanel = null;

    // コマンド
    const command = 'vscodecat-ykaede.ykaede';
    const disposable = vscode.commands.registerCommand(command, () => {
        if (currentPanel) {
            // 既にパネルが開いている場合は表示
            currentPanel.reveal(vscode.ViewColumn.One);
            return;
        }

        // パネルを作成
        currentPanel = vscode.window.createWebviewPanel(
            'ykaede',
            'Yaguchi Kaede',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        // パネルにHTMLを読み込ませる
        const styleUri = currentPanel.webview.asWebviewUri(vscode.Uri.file(context.extensionPath + '/media/style.css'));
        const leftImageUri = currentPanel.webview.asWebviewUri(vscode.Uri.file(context.extensionPath + '/media/left.png'));
        const rightImageUri = currentPanel.webview.asWebviewUri(vscode.Uri.file(context.extensionPath + '/media/right.png'));
        const defaultImageUri = currentPanel.webview.asWebviewUri(vscode.Uri.file(context.extensionPath + '/media/default.png'));

        currentPanel.webview.html = getWebviewContent(styleUri, leftImageUri, rightImageUri, defaultImageUri);

        // パネルが閉じられたらインスタンスを破棄
        currentPanel.onDidDispose(() => {
            currentPanel = null;
        });
    });

    // コマンドを登録
    context.subscriptions.push(disposable);

    // グローバルでキー入力を監視
    vscode.workspace.onDidChangeTextDocument(() => {
        if (currentPanel) {
            currentPanel.webview.postMessage({ type: 'keyPress' });
        }
    });
}

// HTMLを生成
function getWebviewContent(styleUri, leftImageUri, rightImageUri, defaultImageUri) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
            <title>Yaguchi Kaede</title>
        </head>
        <body>
            <div id="animation-container">
                <img id="character" src="${defaultImageUri}" alt="Yaguchi Kaede">
            </div>
            <script>
                const characterImage = document.getElementById('character');
                const images = {
                    default: "${defaultImageUri}",
                    left: "${leftImageUri}",
                    right: "${rightImageUri}"
                };
                let isLeft = true;
                let timeout;

                // 画像サイズをウィンドウサイズに応じて変更
                function resizeImage() {
                    const aspectRatio = characterImage.naturalWidth / characterImage.naturalHeight;
                    const windowAspectRatio = window.innerWidth / window.innerHeight;

                    if (windowAspectRatio > aspectRatio) {
                        characterImage.style.width = 'auto';
                        characterImage.style.height = window.innerHeight + 'px';
                    } else {
                        characterImage.style.width = window.innerWidth + 'px';
                        characterImage.style.height = 'auto';
                    }
                }

                window.addEventListener('resize', resizeImage);
                characterImage.onload = resizeImage;
                resizeImage();

                // VSCodeからメッセージを受け取る
                window.addEventListener('message', event => {
                    const message = event.data;

                    if (message.type === 'keyPress') {
                        characterImage.src = isLeft ? images.left : images.right;
                        isLeft = !isLeft;

                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            characterImage.src = images.default;
                        }, 500);
                    }
                });
            </script>
        </body>
        </html>
    `;
}

// この拡張機能が無効化されたときの処理
function deactivate() {}

module.exports = {
    activate,
    deactivate
};