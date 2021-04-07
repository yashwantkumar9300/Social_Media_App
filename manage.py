#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

import uvicorn


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Social_Media_App.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
    # uvicorn.run("Social_Media_App.asgi:application", host="127.0.0.1", port=8000, log_level="info")