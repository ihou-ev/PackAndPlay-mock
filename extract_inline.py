#!/usr/bin/env python3
"""
HTMLファイルからインラインのCSSとJavaScriptを抽出して外部ファイルに分離するスクリプト
"""

import re
import os
from pathlib import Path

def extract_inline_css_js(html_file):
    """HTMLファイルからインラインのCSSとJSを抽出"""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # ファイル名を取得
    file_path = Path(html_file)
    file_name = file_path.stem
    file_dir = file_path.parent

    # CSSを抽出
    css_pattern = r'<style>(.*?)</style>'
    css_match = re.search(css_pattern, content, re.DOTALL)

    # JavaScriptを抽出（最後の<script>タグのみ）
    js_pattern = r'<script>(.*?)</script>\s*</body>'
    js_match = re.search(js_pattern, content, re.DOTALL)

    css_content = None
    js_content = None

    if css_match:
        css_content = css_match.group(1).strip()

    if js_match:
        js_content = js_match.group(1).strip()

    return css_content, js_content, content

def save_external_files(html_file, css_content, js_content):
    """CSSとJSを外部ファイルに保存"""
    file_path = Path(html_file)
    file_name = file_path.stem
    file_dir = file_path.parent

    # プロジェクトルートディレクトリ
    project_root = file_path.parents[len(file_path.parents) - 2] if len(file_path.parents) > 1 else file_path.parent

    css_saved = False
    js_saved = False

    # CSSを保存
    if css_content:
        # ディレクトリ構造に応じたパスを生成
        if file_dir.name == 'dashboard':
            css_file = project_root / 'css' / 'dashboard' / f'{file_name}.css'
        elif file_dir.name == 'creator':
            css_file = project_root / 'css' / 'creator' / f'{file_name}.css'
        elif file_dir.parent.name == 'creator' and file_dir.name == 'packs':
            css_file = project_root / 'css' / 'creator' / 'packs' / f'{file_name}.css'
        elif file_dir.name == 'overlay':
            css_file = project_root / 'css' / 'overlay' / f'{file_name}.css'
        else:
            css_file = project_root / 'css' / f'{file_name}.css'

        css_file.parent.mkdir(parents=True, exist_ok=True)
        with open(css_file, 'w', encoding='utf-8') as f:
            f.write(css_content)
        css_saved = True
        print(f"CSS saved: {css_file}")

    # JavaScriptを保存
    if js_content:
        # ディレクトリ構造に応じたパスを生成
        if file_dir.name == 'dashboard':
            js_file = project_root / 'js' / 'dashboard' / f'{file_name}.js'
        elif file_dir.name == 'creator':
            js_file = project_root / 'js' / 'creator' / f'{file_name}.js'
        elif file_dir.parent.name == 'creator' and file_dir.name == 'packs':
            js_file = project_root / 'js' / 'creator' / 'packs' / f'{file_name}.js'
        elif file_dir.name == 'overlay':
            js_file = project_root / 'js' / 'overlay' / f'{file_name}.js'
        else:
            js_file = project_root / 'js' / f'{file_name}.js'

        js_file.parent.mkdir(parents=True, exist_ok=True)
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(js_content)
        js_saved = True
        print(f"JS saved: {js_file}")

    return css_saved, js_saved

def update_html_file(html_file, has_css, has_js):
    """HTMLファイルを更新して外部ファイルへの参照に置き換え"""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    file_path = Path(html_file)
    file_name = file_path.stem
    file_dir = file_path.parent

    # ディレクトリの深さに応じた相対パスを計算
    depth = len(file_path.relative_to(file_path.parents[len(file_path.parents) - 2]).parts) - 1
    prefix = '../' * depth if depth > 0 else ''

    # CSSパスを決定
    if file_dir.name == 'dashboard':
        css_path = f'{prefix}css/dashboard/{file_name}.css'
    elif file_dir.name == 'creator':
        css_path = f'{prefix}css/creator/{file_name}.css'
    elif file_dir.parent.name == 'creator' and file_dir.name == 'packs':
        css_path = f'{prefix}../css/creator/packs/{file_name}.css'
    elif file_dir.name == 'overlay':
        css_path = f'{prefix}css/overlay/{file_name}.css'
    else:
        css_path = f'css/{file_name}.css'

    # JavaScriptパスを決定
    if file_dir.name == 'dashboard':
        js_path = f'{prefix}js/dashboard/{file_name}.js'
    elif file_dir.name == 'creator':
        js_path = f'{prefix}js/creator/{file_name}.js'
    elif file_dir.parent.name == 'creator' and file_dir.name == 'packs':
        js_path = f'{prefix}../js/creator/packs/{file_name}.js'
    elif file_dir.name == 'overlay':
        js_path = f'{prefix}js/overlay/{file_name}.js'
    else:
        js_path = f'js/{file_name}.js'

    # インラインCSSを削除して外部リンクに置き換え
    if has_css:
        # <style>...</style>を削除
        content = re.sub(r'\s*<style>.*?</style>\s*', '\n', content, flags=re.DOTALL)
        # css/style.cssの後にリンクを追加（既に存在しない場合）
        if f'<link rel="stylesheet" href="{css_path}">' not in content:
            content = re.sub(
                r'(<link rel="stylesheet" href="[^"]*style\.css">)',
                f'\\1\n  <link rel="stylesheet" href="{css_path}">',
                content
            )

    # インラインJavaScriptを削除して外部リンクに置き換え
    if has_js:
        # 最後の<script>...</script>を削除
        content = re.sub(r'<script>(.*?)</script>\s*</body>', '</body>', content, flags=re.DOTALL)
        # js/main.jsの後にスクリプトタグを追加（既に存在しない場合）
        if f'<script src="{js_path}"></script>' not in content:
            content = re.sub(
                r'(<script src="[^"]*main\.js"></script>)',
                f'\\1\n  <script src="{js_path}"></script>',
                content
            )

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Updated: {html_file}")

def process_html_file(html_file):
    """HTMLファイルを処理"""
    print(f"\nProcessing: {html_file}")

    css_content, js_content, original_content = extract_inline_css_js(html_file)

    # 外部ファイルに保存
    css_saved, js_saved = save_external_files(html_file, css_content, js_content)

    # HTMLファイルを更新
    if css_saved or js_saved:
        update_html_file(html_file, css_saved, js_saved)
    else:
        print(f"No inline CSS/JS found in {html_file}")

def main():
    """メイン処理"""
    # 処理対象のHTMLファイルリスト
    html_files = [
        'inventory.html',
        'following.html',
        'profile.html',
        'history.html',
        'login.html',
        'creator/tanaka.html',
        'creator/packs/pack-detail.html',
        'creator/packs/pack-open.html',
        'dashboard/index.html',
        'dashboard/cards.html',
        'dashboard/packs.html',
        'dashboard/redemptions.html',
        'overlay/index.html',
    ]

    project_root = Path(__file__).parent

    for html_file in html_files:
        file_path = project_root / html_file
        if file_path.exists():
            process_html_file(str(file_path))
        else:
            print(f"File not found: {file_path}")

if __name__ == '__main__':
    main()
