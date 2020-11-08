# deno-lsp (WIP)

An experimental LSP server implementation for Deno🦕

## Usage

**vim-lsp**

```vim
autocmd User lsp_setup call lsp#register_server({
\ 'name': 'deno-lsp',
\ 'cmd': {server_info->['deno', 'run', '--allow-read', '--allow-write', '--quiet', 'cli.ts']},
\ 'allowlist': ['typescript'],
\ 'blocklist': [],
\ 'config': {},
\ 'workspace_config': {'param': {'enabled': v:true}},
\ 'languageId': {server_info->'typescript'},
\ })
```

## See also

* https://github.com/theia-ide/typescript-language-server
* https://github.com/tennashi/lsp_spec_ja
