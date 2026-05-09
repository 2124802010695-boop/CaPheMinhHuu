import os

def generate_tree(dir_path, prefix='', out_file=None, ignore_dirs=None, ignore_exts=None):
    if ignore_dirs is None:
        ignore_dirs = {'node_modules', 'bin', 'obj', '.git', '.vs', 'dist', 'build', 'TestResults', '.idea', '__pycache__'}
    if ignore_exts is None:
        ignore_exts = {'.md', '.docx', '.ppt', '.txt', '.csv', '.mpp', '.zip', '.pptx', '.pdf'}
    
    try:
        entries = sorted(os.listdir(dir_path))
    except PermissionError:
        return
        
    filtered_entries = []
    for e in entries:
        full_path = os.path.join(dir_path, e)
        if os.path.isdir(full_path) and e in ignore_dirs:
            continue
        if os.path.isfile(full_path):
            _, ext = os.path.splitext(e)
            if ext.lower() in ignore_exts:
                continue
        filtered_entries.append(e)
        
    for i, e in enumerate(filtered_entries):
        is_last = (i == len(filtered_entries) - 1)
        full_path = os.path.join(dir_path, e)
        
        connector = '\\---' if is_last else '+---'
        out_file.write(f'{prefix}{connector}{e}\n')
        
        if os.path.isdir(full_path):
            new_prefix = prefix + ('    ' if is_last else '|   ')
            generate_tree(full_path, new_prefix, out_file, ignore_dirs, ignore_exts)

with open('clean_tree.txt', 'w', encoding='utf-8') as f:
    f.write('D:\\BaoCaoTotNghiep_2026\\CaPheMinhHuu\n')
    folders = ['.github', 'CaPheMinhHuu', 'capheminhhuu.ui', 'capheminhhuu-customer', 'diagrams']
    
    # Filter out folders that don't exist
    existing_folders = [d for d in folders if os.path.exists(d)]
    
    for i, d in enumerate(existing_folders):
        connector = '\\---' if i == len(existing_folders) - 1 else '+---'
        f.write(f'{connector}{d}\n')
        prefix = '    ' if i == len(existing_folders) - 1 else '|   '
        generate_tree(d, prefix, f)
