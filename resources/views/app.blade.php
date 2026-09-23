<!DOCTYPE html>
<html lang="{{ auth()->user()?->ui_locale === 'su' ? 'su' : 'id' }}" style="color-scheme: light;">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <style>
            html {
                background-color: #fcf8ff;
            }
        </style>

        <link rel="icon" href="/images/sawala-mark.png?v=2" type="image/png" sizes="256x256">
        <link rel="apple-touch-icon" href="/images/sawala-mark.png?v=2">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Belajar Basa Sunda') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
