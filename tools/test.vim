let g:lsp_log_file = expand("<sfile>:h:h") . "/vim-lsp.log"
autocmd User lsp_setup call lsp#register_server({
\ 'name': 'deno-lsp',
\ 'cmd': {server_info->['deno', 'run', '--allow-read', '--allow-write', '--quiet', 'cli.ts']},
\ 'allowlist': ['typescript'],
\ 'blocklist': [],
\ 'config': {},
\ 'workspace_config': {'param': {'enabled': v:true}},
\ 'languageId': {server_info->'typescript'},
\ })
