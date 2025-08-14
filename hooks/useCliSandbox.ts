import { useState, useCallback } from 'react';
import { VFS, VFSNode, CommandHistoryEntry } from '../types';

const initialVFS: VFS = {
  'projects': {
    type: 'directory',
    children: {
      'README.md': { type: 'file', content: 'This is a project directory.' },
    },
  },
  'notes.txt': { type: 'file', content: 'My secret notes.' },
  'welcome.sh': { type: 'file', content: 'echo "Welcome to the LearnSphere CLI Sandbox!"' },
};

export const useCliSandbox = () => {
  const [history, setHistory] = useState<CommandHistoryEntry[]>([]);
  const [vfs, setVfs] = useState<VFS>(JSON.parse(JSON.stringify(initialVFS)));
  const [currentPath, setCurrentPath] = useState('/');

  const resolvePath = (path: string): { node: VFSNode | null; parent: any; name: string; fullPath: string } => {
    const segments = (path.startsWith('/') ? path : `${currentPath === '/' ? '' : currentPath}/${path}`)
      .split('/')
      .filter(p => p && p !== '.');
    
    let currentNode: VFS | VFSNode = { type: 'directory', children: vfs };
    let parentNode: any = null;
    let finalPath = [''];

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (segment === '..') {
            finalPath.pop();
            continue;
        }
        if (currentNode && currentNode.type === 'directory') {
            parentNode = currentNode;
            currentNode = currentNode.children[segment];
            finalPath.push(segment);
        } else {
            return { node: null, parent: null, name: '', fullPath: '' };
        }
    }

    const name = segments[segments.length - 1] === '..' ? finalPath[finalPath.length -1] : segments[segments.length - 1];
    return { node: currentNode as VFSNode, parent: parentNode, name, fullPath: finalPath.join('/') || '/' };
  };

  const executeCommand = (command: string): any => {
    const [cmd, ...args] = command.trim().split(' ');
    const { node: pathNode } = resolvePath(currentPath);

    switch (cmd) {
      case 'help':
        return `Available commands: help, ls, cd, cat, echo, pwd, clear`;
      case 'pwd':
        return currentPath;
      case 'ls':
        if (pathNode && pathNode.type === 'directory') {
          return {
            _type: 'ls',
            items: Object.entries(pathNode.children).map(([name, node]) => ({
              name,
              type: node.type,
            })),
          };
        }
        return `ls: '${currentPath}': No such file or directory`;
      case 'cd':
        const targetPath = args[0] || '/';
        const { node: targetNode, fullPath } = resolvePath(targetPath);
        if (targetNode && targetNode.type === 'directory') {
          setCurrentPath(fullPath);
          return null;
        }
        return `cd: no such file or directory: ${targetPath}`;
      case 'cat':
        const { node: fileNode } = resolvePath(args[0]);
        if (fileNode && fileNode.type === 'file') {
          return { _type: 'cat', content: fileNode.content };
        }
        return `cat: ${args[0]}: No such file or directory`;
      case 'echo':
          const outputIndex = args.indexOf('>');
          if (outputIndex !== -1) {
              const content = args.slice(0, outputIndex).join(' ');
              const filePath = args[outputIndex + 1];
              if (!filePath) return "echo: syntax error near unexpected token `newline'";

              const { parent, name } = resolvePath(filePath);
              if (parent && parent.type === 'directory') {
                  parent.children[name] = { type: 'file', content: content.replace(/^"|"$/g, '') };
                  setVfs({ ...vfs });
                  return null;
              }
              return `echo: cannot create file '${filePath}': No such file or directory`;
          }
          return args.join(' ');
      case 'clear':
        setHistory([]);
        return null;
      case '':
        return null;
      default:
        return `command not found: ${cmd}`;
    }
  };

  const processCommand = useCallback((command: string) => {
    const output = executeCommand(command);
    const newEntry: CommandHistoryEntry = { command, output, path: currentPath };
    setHistory(prev => [...prev, newEntry]);
  }, [currentPath, vfs]);

  return { history, processCommand, currentPath };
};
