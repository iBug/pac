#!/usr/bin/python3

import sys
import time
import os


RELEASE_MARKDOWN_PATH = "release-info.md"


def create_output(name, content, target=sys.stdout):
    print(f"::set-output name={name}::{content}", file=target)


def main():
    # Credits: https://stackoverflow.com/a/1398742/5958455
    # Depends on os.environ["TZ"]
    time.tzset()
    now = time.localtime(time.time())

    create_output("tag_name", "release-{}".format(time.strftime("%Y%m%d", now)))
    create_output("release_name", "Release {}".format(time.strftime("%Y-%m-%d", now)))
    create_output("body_path", RELEASE_MARKDOWN_PATH)

    # Produce the markdown
    with open(RELEASE_MARKDOWN_PATH, "w") as f:
        body = "This is an automatic release created from GitHub Actions run {} on {} ({})".format(
            os.environ.get("GITHUB_RUN_NUMBER", "&lt;unknown&gt;"),
            time.strftime("%B %-d, %Y", now),
            os.environ.get("TZ", "UTC"),
        )
        print(body, file=f)


if __name__ == '__main__':
    main()
