import { useState } from 'react'

import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import Column, { ColumnType } from './Column'

const Example = () => {
  const [columns, setColumns] = useState<ColumnType[]>([
    {
      id: 'Column1',
      title: 'Column1',
      cards: [
        {
          id: 'Card1',
          title: 'Card1'
        },
        {
          id: 'Card2',
          title: 'Card2'
        }
      ]
    },
    {
      id: 'Column2',
      title: 'Column2',
      cards: [
        {
          id: 'Card3',
          title: 'Card3'
        },
        {
          id: 'Card4',
          title: 'Card4'
        },
        {
          id: 'Card5',
          title: 'Card5'
        },
        {
          id: 'Card6',
          title: 'Card6'
        }
      ]
    }
  ])

  const findColumn = (unique: string | null) => {
    if (!unique) {
      return null
    }

    if (columns.some((c) => c.id === unique)) {
      return columns.find((c) => c.id === unique) ?? null
    }
    const id = String(unique)
    const itemWithColumnId = columns.flatMap((c) => {
      const columnId = c.id
      return c.cards.map((i) => ({ itemId: i?.id, columnId: columnId }))
    })
    const columnId = itemWithColumnId.find((i) => i.itemId === id)?.columnId
    return columns.find((c) => c.id === columnId) ?? null
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over, delta } = event
    const activeId = String(active.id)
    const overId = over ? String(over.id) : null
    const activeColumn = findColumn(activeId)
    const overColumn = findColumn(overId)
    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return null
    }

    const activeItems = activeColumn.cards
    const overItems = overColumn.cards
    const activeIndex = activeItems.findIndex((i) => i?.id === activeId)
    const overIndex = overItems.findIndex((i) => i?.id === overId)
    const newIndex = () => {
      const putOnBelowLastItem = overIndex === overItems.length - 1 && delta.y > 0
      const modifier = putOnBelowLastItem ? 1 : 0
      return overIndex >= 0 ? overIndex + modifier : overItems.length + 1
    }
    const newColumns = columns.map((c) => {
      if (c.id === activeColumn.id) {
        c.cards = activeItems.filter((i) => i.id !== activeId)
        return c
      } else if (c.id === overColumn.id) {
        c.cards = [
          ...overItems.slice(0, newIndex()),
          activeItems[activeIndex],
          ...overItems.slice(newIndex(), overItems.length)
        ]
        return c
      } else {
        return c
      }
    })

    setColumns(newColumns)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    const activeId = String(active.id)
    const overId = over ? String(over.id) : null
    const activeColumn = findColumn(activeId)
    const overColumn = findColumn(overId)
    if (!activeColumn || !overColumn || activeColumn !== overColumn) {
      return null
    }
    const activeIndex = activeColumn.cards.findIndex((i) => i.id === activeId)
    const overIndex = overColumn.cards.findIndex((i) => i.id === overId)

    if (activeIndex !== overIndex) {
      const newColumns = columns.map((column) => {
        if (column.id === activeColumn.id) {
          column.cards = arrayMove(overColumn.cards, activeIndex, overIndex)
        }
        return column
      })
      setColumns(newColumns)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="App" style={{ display: 'flex', flexDirection: 'row', padding: '20px' }}>
        {columns.map((column) => (
          <Column key={column.id} id={column.id} title={column.title} cards={column.cards}></Column>
        ))}
      </div>
    </DndContext>
  )
}

export default Example
