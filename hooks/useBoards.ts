import React, { useState, useEffect, useCallback } from 'react';
import { Board, BoardItem } from '../types';
import { createNewBoard } from '../utils/boardUtils';
import { GRID_SIZE } from '../constants';
import { storage } from '../utils/storageUtils';

export const useBoards = () => {
  const [isBoardsLoaded, setIsBoardsLoaded] = useState(false);
  const [boards, setBoards] = useState<Board[]>([createNewBoard()]);
  const [activeBoardIndex, setActiveBoardIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedBoards = await storage.getItem('pixelBoard_savedBoards');
        if (savedBoards) {
          const parsed = JSON.parse(savedBoards);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBoards(parsed);
          }
        }
        const savedIndex = await storage.getItem('pixelBoard_activeBoardIndex');
        if (savedIndex) {
          const index = parseInt(savedIndex, 10);
          if (!isNaN(index)) setActiveBoardIndex(index);
        }
      } catch (e) {
        console.error("ANTI_CLOUD: Fallo al cargar los tableros", e);
      } finally {
        setIsBoardsLoaded(true);
      }
    };
    loadData();
  }, []);

  const activeBoard = boards[activeBoardIndex] || boards[0];

  useEffect(() => {
    if (isBoardsLoaded) storage.setItem('pixelBoard_savedBoards', JSON.stringify(boards));
  }, [boards, isBoardsLoaded]);

  useEffect(() => {
    if (isBoardsLoaded) storage.setItem('pixelBoard_activeBoardIndex', String(activeBoardIndex));
  }, [activeBoardIndex, isBoardsLoaded]);

  useEffect(() => {
    if (activeBoardIndex >= boards.length) {
      setActiveBoardIndex(0);
    }
  }, [boards.length, activeBoardIndex]);

  const handleUpdateItem = useCallback((updatedItem: BoardItem, selectedItemIds: string[]) => {
    setBoards(prev => prev.map((board, index) => {
      if (index !== activeBoardIndex) return board;

      const oldItem = board.items.find(i => i.id === updatedItem.id);
      if (!oldItem) return board;

      const dx = updatedItem.x - oldItem.x;
      const dy = updatedItem.y - oldItem.y;

      if (selectedItemIds.includes(updatedItem.id) && selectedItemIds.length > 1 && (dx !== 0 || dy !== 0)) {
        return {
          ...board,
          items: board.items.map(item => {
            if (selectedItemIds.includes(item.id)) {
              if (item.id === updatedItem.id) return updatedItem;
              return {
                ...item,
                x: item.x + dx,
                y: item.y + dy
              };
            }
            return item;
          })
        };
      }

      return { ...board, items: board.items.map(item => item.id === updatedItem.id ? updatedItem : item) };
    }));
  }, [activeBoardIndex]);

  const handleDeleteItem = useCallback((id: string, setSelectedItemIds: React.Dispatch<React.SetStateAction<string[]>>, setSelectedItemId: React.Dispatch<React.SetStateAction<string | null>>) => {
    setBoards(prev => prev.map((board, index) =>
      index === activeBoardIndex
        ? { ...board, items: board.items.filter(item => item.id !== id) }
        : board
    ));
    setSelectedItemIds(prev => prev.filter(itemId => itemId !== id));
    setSelectedItemId(prev => prev === id ? null : prev);
  }, [activeBoardIndex]);

  const handleDuplicateItem = useCallback((id: string) => {
    setBoards(prev => {
      const boardsCopy = [...prev];
      const boardToUpdate = boardsCopy[activeBoardIndex];
      if (!boardToUpdate) return prev;

      const itemToDuplicate = boardToUpdate.items.find(item => item.id === id);
      if (!itemToDuplicate) return prev;

      const newItem: BoardItem = {
        ...itemToDuplicate,
        id: `item_${Date.now()}_${Math.random()}`,
        x: itemToDuplicate.x + GRID_SIZE,
        y: itemToDuplicate.y + GRID_SIZE,
      };

      const boardWidth = boardToUpdate.width || 3000;
      const boardHeight = boardToUpdate.height || 2000;
      newItem.x = Math.max(0, Math.min(newItem.x, boardWidth - newItem.width));
      newItem.y = Math.max(0, Math.min(newItem.y, boardHeight - newItem.height));

      const newItems = [...boardToUpdate.items, newItem];
      boardsCopy[activeBoardIndex] = { ...boardToUpdate, items: newItems };
      return boardsCopy;
    });
  }, [activeBoardIndex]);

  const handleSendItemToBack = useCallback((id: string) => {
    setBoards(prev => prev.map((board, index) => {
      if (index !== activeBoardIndex) return board;
      const items = [...board.items];
      const itemIndex = items.findIndex(item => item.id === id);
      if (itemIndex > 0) {
        const [item] = items.splice(itemIndex, 1);
        items.unshift(item);
      }
      return { ...board, items };
    }));
  }, [activeBoardIndex]);

  const handleReorderItem = useCallback((id: string, direction: 'up' | 'down' | 'front' | 'back') => {
    setBoards(prev => prev.map((board, index) => {
      if (index !== activeBoardIndex) return board;
      const items = [...board.items];
      const itemIndex = items.findIndex(item => item.id === id);
      if (itemIndex === -1) return board;

      const [item] = items.splice(itemIndex, 1);

      if (direction === 'up') {
        // Move one step forward (towards the end of the array)
        const newIndex = Math.min(items.length, itemIndex + 1);
        items.splice(newIndex, 0, item);
      } else if (direction === 'down') {
        // Move one step backward (towards the start of the array)
        const newIndex = Math.max(0, itemIndex - 1);
        items.splice(newIndex, 0, item);
      } else if (direction === 'front') {
        items.push(item);
      } else if (direction === 'back') {
        items.unshift(item);
      }

      return { ...board, items };
    }));
  }, [activeBoardIndex]);

  const handleSendItemToBoard = useCallback((itemId: string, targetBoardIndex: number) => {
    if (targetBoardIndex === activeBoardIndex) return;
    setBoards(prevBoards => {
      const currentBoard = prevBoards[activeBoardIndex];
      const itemToSend = currentBoard.items.find(item => item.id === itemId);
      if (!itemToSend) return prevBoards;
      const newBoards = [...prevBoards];
      newBoards[activeBoardIndex] = {
        ...currentBoard,
        items: currentBoard.items.filter(item => item.id !== itemId),
      };
      const destinationBoard = newBoards[targetBoardIndex];
      newBoards[targetBoardIndex] = {
        ...destinationBoard,
        items: [...destinationBoard.items, itemToSend],
      };
      return newBoards;
    });
  }, [activeBoardIndex]);

  const handleAddBoard = useCallback(() => {
    setBoards(prev => [...prev, createNewBoard()]);
  }, []);

  const handleRemoveBoard = useCallback((index: number) => {
    setBoards(prev => {
      if (prev.length <= 1) return prev;
      const newBoards = prev.filter((_, i) => i !== index);
      if (activeBoardIndex >= newBoards.length) {
        setActiveBoardIndex(newBoards.length - 1);
      }
      return newBoards;
    });
  }, [activeBoardIndex]);

  const handleGroupItems = useCallback((itemIds: string[]) => {
    if (itemIds.length < 2) return;
    const groupId = `group-${Date.now()}`;
    setBoards(prev => prev.map((board, index) =>
      index === activeBoardIndex
        ? { ...board, items: board.items.map(item => itemIds.includes(item.id) ? { ...item, groupId } : item) }
        : board
    ));
  }, [activeBoardIndex]);

  const handleUngroupItems = useCallback((itemIds: string[]) => {
    setBoards(prev => prev.map((board, index) =>
      index === activeBoardIndex
        ? { ...board, items: board.items.map(item => itemIds.includes(item.id) ? { ...item, groupId: undefined } : item) }
        : board
    ));
  }, [activeBoardIndex]);

  const handleUpdateBoardSettings = useCallback((settings: Partial<Board>) => {
    setBoards(prev => prev.map((board, index) =>
      index === activeBoardIndex ? { ...board, ...settings } : board
    ));
  }, [activeBoardIndex]);

  const handleAddConnection = useCallback((fromId: string, toId: string) => {
    setBoards(prev => prev.map((board, index) => {
      if (index !== activeBoardIndex) return board;
      const connections = board.connections || [];
      if (fromId === toId || connections.some(c => (c.fromId === fromId && c.toId === toId) || (c.fromId === toId && c.toId === fromId))) {
        return board;
      }
      return {
        ...board,
        connections: [...connections, {
          id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          fromId,
          toId,
          color: 'var(--pixel-highlight-color, #ffaa00)'
        }]
      };
    }));
  }, [activeBoardIndex]);

  const handleRemoveConnection = useCallback((connectionId: string) => {
    setBoards(prev => prev.map((board, index) => {
      if (index !== activeBoardIndex) return board;
      return {
        ...board,
        connections: (board.connections || []).filter(c => c.id !== connectionId)
      };
    }));
  }, [activeBoardIndex]);

  return {
    isBoardsLoaded,
    boards,
    setBoards,
    activeBoardIndex,
    setActiveBoardIndex,
    activeBoard,
    handleUpdateItem,
    handleDeleteItem,
    handleDuplicateItem,
    handleSendItemToBack,
    handleReorderItem,
    handleGroupItems,
    handleUngroupItems,
    handleSendItemToBoard,
    handleAddBoard,
    handleRemoveBoard,
    handleUpdateBoardSettings,
    handleAddConnection,
    handleRemoveConnection
  };
};
