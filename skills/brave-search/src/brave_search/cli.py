#!/usr/bin/env python3
# ABOUTME: Brave Search API CLI client.
# ABOUTME: Provides web, image, news search and AI grounding via Brave Search API.
"""
Brave Search API client.

Supports web search, image search, news search, AI grounding, and suggestions.
Requires BRAVE_API_KEY environment variable.

Get an API key at: https://api-dashboard.search.brave.com
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.parse
import urllib.error


BASE_URL = "https://api.search.brave.com/res/v1"


def get_api_key():
    """Get API key from environment, with helpful error if missing."""
    key = os.environ.get('BRAVE_API_KEY')
    if not key:
        print("""
╔══════════════════════════════════════════════════════════════════╗
║  BRAVE_API_KEY not set                                           ║
╠══════════════════════════════════════════════════════════════════╣
║  Get a free API key at:                                          ║
║  https://api-dashboard.search.brave.com                          ║
║                                                                  ║
║  Then set the environment variable:                              ║
║                                                                  ║
║     export BRAVE_API_KEY="your-key-here"                         ║
║                                                                  ║
║  Add to ~/.bashrc or ~/.zshrc to persist across sessions.        ║
╚══════════════════════════════════════════════════════════════════╝
""", file=sys.stderr)
        return None
    return key


def make_request(endpoint, params=None, method="GET", json_body=None):
    """Make an API request to Brave Search."""
    key = get_api_key()
    if not key:
        return None

    url = f"{BASE_URL}/{endpoint}"
    if params:
        url = f"{url}?{urllib.parse.urlencode(params, doseq=True)}"

    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": key,
    }

    data = None
    if json_body:
        headers["Content-Type"] = "application/json"
        data = json.dumps(json_body).encode('utf-8')

    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            # Handle gzip
            if response.info().get('Content-Encoding') == 'gzip':
                import gzip
                return json.loads(gzip.decompress(response.read()).decode('utf-8'))
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = ""
        if e.fp:
            raw = e.read()
            # Handle gzip-encoded error responses
            if raw[:2] == b'\x1f\x8b':  # gzip magic bytes
                import gzip
                try:
                    error_body = gzip.decompress(raw).decode('utf-8')
                except Exception:
                    error_body = f"[gzip error body, {len(raw)} bytes]"
            else:
                try:
                    error_body = raw.decode('utf-8')
                except UnicodeDecodeError:
                    error_body = f"[binary error body, {len(raw)} bytes]"
        print(f"HTTP Error {e.code}: {e.reason}", file=sys.stderr)
        if error_body:
            try:
                error_json = json.loads(error_body)
                print(f"Details: {json.dumps(error_json, indent=2)}", file=sys.stderr)
            except json.JSONDecodeError:
                print(f"Details: {error_body[:500]}", file=sys.stderr)
        return None
    except urllib.error.URLError as e:
        print(f"URL Error: {e.reason}", file=sys.stderr)
        return None


def web_search(query, count=10, country="US", lang="en", safesearch="moderate",
               freshness=None, extra_snippets=False, result_filter=None, offset=0):
    """
    Perform a web search.

    Args:
        query: Search query string
        count: Number of results (max 20)
        country: Country code (US, GB, DE, etc.)
        lang: Language code (en, de, fr, etc.)
        safesearch: off, moderate, or strict
        freshness: pd (24h), pw (7d), pm (31d), py (365d), or date range
        extra_snippets: Include additional snippets
        result_filter: Comma-separated list (web, news, videos, discussions, faq)
        offset: Pagination offset (0-9)
    """
    params = {
        "q": query,
        "count": min(count, 20),
        "country": country,
        "search_lang": lang,
        "safesearch": safesearch,
        "offset": offset,
    }

    if freshness:
        params["freshness"] = freshness
    if extra_snippets:
        params["extra_snippets"] = "true"
    if result_filter:
        params["result_filter"] = result_filter

    return make_request("web/search", params)


def image_search(query, count=20, country="US", lang="en", safesearch="moderate"):
    """
    Search for images.

    Args:
        query: Search query
        count: Number of results (max 200)
        country: Country code
        lang: Language code
        safesearch: off, moderate, or strict
    """
    params = {
        "q": query,
        "count": min(count, 200),
        "country": country,
        "search_lang": lang,
        "safesearch": safesearch,
    }

    return make_request("images/search", params)


def news_search(query, count=10, country="US", lang="en", safesearch="moderate",
                freshness=None):
    """
    Search for news articles.

    Args:
        query: Search query
        count: Number of results
        country: Country code
        lang: Language code
        safesearch: off, moderate, or strict
        freshness: pd (24h), pw (7d), pm (31d), py (365d)
    """
    params = {
        "q": query,
        "count": count,
        "country": country,
        "search_lang": lang,
        "safesearch": safesearch,
    }

    if freshness:
        params["freshness"] = freshness

    return make_request("news/search", params)


def suggest(query, country="US", count=5):
    """
    Get search suggestions/autocomplete.

    Args:
        query: Partial query string
        country: Country code
        count: Number of suggestions
    """
    params = {
        "q": query,
        "country": country,
        "count": count,
    }

    return make_request("suggest/search", params)


def ai_grounding(question, country="us", language="en", enable_research=False,
                 enable_citations=True):
    """
    Get AI-grounded answer with citations.

    Requires AI Grounding subscription.

    Args:
        question: The question to answer
        country: Country code (lowercase)
        language: Language code
        enable_research: Allow multiple searches (slower, more thorough)
        enable_citations: Include source citations
    """
    body = {
        "messages": [{"role": "user", "content": question}],
        "model": "brave",
        "stream": False,
        "country": country,
        "language": language,
        "enable_citations": enable_citations,
        "enable_research": enable_research,
    }

    return make_request("chat/completions", method="POST", json_body=body)


def format_web_results(results, show_json=False):
    """Format web search results for display."""
    if show_json:
        print(json.dumps(results, indent=2))
        return

    if not results:
        print("No results")
        return

    # Show query info
    query = results.get("query", {})
    if query.get("altered"):
        print(f"Showing results for: {query['altered']}")
        print(f"(Original query: {query['original']})\n")

    # Web results
    web = results.get("web", {})
    web_results = web.get("results", [])

    if not web_results:
        print("No web results found")
        return

    for i, r in enumerate(web_results, 1):
        print(f"{i}. {r.get('title', 'No title')}")
        print(f"   {r.get('url', '')}")
        print(f"   {r.get('description', '')[:200]}")
        if r.get('extra_snippets'):
            for snippet in r['extra_snippets'][:2]:
                print(f"   → {snippet[:150]}...")
        print()


def format_image_results(results, show_json=False):
    """Format image search results for display."""
    if show_json:
        print(json.dumps(results, indent=2))
        return

    if not results:
        print("No results")
        return

    images = results.get("results", [])

    if not images:
        print("No images found")
        return

    for i, img in enumerate(images, 1):
        props = img.get("properties", {})
        thumb = img.get("thumbnail", {})
        print(f"{i}. {img.get('title', 'No title')}")
        print(f"   Source: {img.get('url', '')}")
        print(f"   Image: {props.get('url', '')}")
        if props.get('width') and props.get('height'):
            print(f"   Size: {props['width']}x{props['height']}")
        print()


def format_news_results(results, show_json=False):
    """Format news search results for display."""
    if show_json:
        print(json.dumps(results, indent=2))
        return

    if not results:
        print("No results")
        return

    news = results.get("results", [])

    if not news:
        print("No news found")
        return

    for i, article in enumerate(news, 1):
        print(f"{i}. {article.get('title', 'No title')}")
        print(f"   {article.get('url', '')}")
        print(f"   Source: {article.get('meta_url', {}).get('hostname', 'Unknown')}")
        if article.get('age'):
            print(f"   Age: {article['age']}")
        print(f"   {article.get('description', '')[:200]}")
        print()


def format_suggest_results(results, show_json=False):
    """Format suggest results for display."""
    if show_json:
        print(json.dumps(results, indent=2))
        return

    if not results:
        print("No suggestions")
        return

    suggestions = results.get("results", [])

    if not suggestions:
        print("No suggestions found")
        return

    print("Suggestions:")
    for i, s in enumerate(suggestions, 1):
        query = s.get("query", "")
        print(f"  {i}. {query}")


def format_ai_results(results, show_json=False):
    """Format AI grounding results for display."""
    if show_json:
        print(json.dumps(results, indent=2))
        return

    if not results:
        print("No answer available")
        return

    choices = results.get("choices", [])
    if not choices:
        print("No answer in response")
        return

    message = choices[0].get("message", {})
    content = message.get("content", "")

    print("Answer:")
    print("-" * 60)
    print(content)
    print("-" * 60)

    usage = results.get("usage", {})
    if usage:
        print(f"\nTokens: {usage.get('total_tokens', 'N/A')}")


def main():
    parser = argparse.ArgumentParser(
        description="Brave Search API client",
        epilog="Requires BRAVE_API_KEY environment variable."
    )

    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # Web search
    web_parser = subparsers.add_parser('web', help='Web search')
    web_parser.add_argument('query', help='Search query')
    web_parser.add_argument('--count', '-c', type=int, default=10, help='Number of results (max 20)')
    web_parser.add_argument('--country', default='US', help='Country code (US, GB, DE, etc.)')
    web_parser.add_argument('--lang', default='en', help='Language code')
    web_parser.add_argument('--safesearch', choices=['off', 'moderate', 'strict'], default='moderate')
    web_parser.add_argument('--freshness', help='Time filter: pd, pw, pm, py, or YYYY-MM-DDtoYYYY-MM-DD')
    web_parser.add_argument('--extra-snippets', action='store_true', help='Include extra snippets')
    web_parser.add_argument('--filter', help='Result types: web,news,videos,discussions,faq')
    web_parser.add_argument('--offset', type=int, default=0, help='Pagination offset (0-9)')
    web_parser.add_argument('--json', '-j', action='store_true', help='Output raw JSON')

    # Image search
    img_parser = subparsers.add_parser('images', help='Image search')
    img_parser.add_argument('query', help='Search query')
    img_parser.add_argument('--count', '-c', type=int, default=20, help='Number of results (max 200)')
    img_parser.add_argument('--country', default='US', help='Country code')
    img_parser.add_argument('--lang', default='en', help='Language code')
    img_parser.add_argument('--safesearch', choices=['off', 'moderate', 'strict'], default='moderate')
    img_parser.add_argument('--json', '-j', action='store_true', help='Output raw JSON')

    # News search
    news_parser = subparsers.add_parser('news', help='News search')
    news_parser.add_argument('query', help='Search query')
    news_parser.add_argument('--count', '-c', type=int, default=10, help='Number of results')
    news_parser.add_argument('--country', default='US', help='Country code')
    news_parser.add_argument('--lang', default='en', help='Language code')
    news_parser.add_argument('--safesearch', choices=['off', 'moderate', 'strict'], default='moderate')
    news_parser.add_argument('--freshness', help='Time filter: pd, pw, pm, py')
    news_parser.add_argument('--json', '-j', action='store_true', help='Output raw JSON')

    # Suggest
    suggest_parser = subparsers.add_parser('suggest', help='Get search suggestions')
    suggest_parser.add_argument('query', help='Partial query')
    suggest_parser.add_argument('--count', '-c', type=int, default=5, help='Number of suggestions')
    suggest_parser.add_argument('--country', default='US', help='Country code')
    suggest_parser.add_argument('--json', '-j', action='store_true', help='Output raw JSON')

    # AI Grounding
    ai_parser = subparsers.add_parser('ai', help='AI-grounded answer (requires AI Grounding plan)')
    ai_parser.add_argument('question', help='Question to answer')
    ai_parser.add_argument('--country', default='us', help='Country code (lowercase)')
    ai_parser.add_argument('--lang', default='en', help='Language code')
    ai_parser.add_argument('--research', action='store_true', help='Enable deep research (multiple searches)')
    ai_parser.add_argument('--no-citations', action='store_true', help='Disable citations')
    ai_parser.add_argument('--json', '-j', action='store_true', help='Output raw JSON')

    # Check key
    subparsers.add_parser('check-key', help='Check if API key is set')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    if args.command == 'check-key':
        key = get_api_key()
        if key:
            print(f"API key is set: {key[:8]}...{key[-4:]}")
        return

    if args.command == 'web':
        results = web_search(
            args.query,
            count=args.count,
            country=args.country,
            lang=args.lang,
            safesearch=args.safesearch,
            freshness=args.freshness,
            extra_snippets=args.extra_snippets,
            result_filter=args.filter,
            offset=args.offset,
        )
        format_web_results(results, args.json)

    elif args.command == 'images':
        results = image_search(
            args.query,
            count=args.count,
            country=args.country,
            lang=args.lang,
            safesearch=args.safesearch,
        )
        format_image_results(results, args.json)

    elif args.command == 'news':
        results = news_search(
            args.query,
            count=args.count,
            country=args.country,
            lang=args.lang,
            safesearch=args.safesearch,
            freshness=args.freshness,
        )
        format_news_results(results, args.json)

    elif args.command == 'suggest':
        results = suggest(
            args.query,
            country=args.country,
            count=args.count,
        )
        format_suggest_results(results, args.json)

    elif args.command == 'ai':
        results = ai_grounding(
            args.question,
            country=args.country,
            language=args.lang,
            enable_research=args.research,
            enable_citations=not args.no_citations,
        )
        format_ai_results(results, args.json)


if __name__ == '__main__':
    main()
