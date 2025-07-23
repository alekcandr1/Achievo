import { TaskStatus } from '@/common/enums'
import { useGetTasksQuery } from '@/features/todolists/api/tasksApi'
import type { DomainTodolist } from '@/features/todolists/lib/types'
import List from '@mui/material/List'
import { TaskItem } from './TaskItem/TaskItem'
import { TasksSkeleton } from './TasksSkeleton/TasksSkeleton'
import { useState } from 'react';
import { TasksPagination } from '@/features/todolists/ui/Todolists/TodolistItem/TasksPagination/TasksPagination.tsx';
import { PAGE_SIZE } from '@/common/constants';

type Props = {
    todolist: DomainTodolist
}

export const Tasks = ({ todolist }: Props) => {
    const { id, filter } = todolist
    const [page, setPage] = useState(1)

    const { data, isLoading } = useGetTasksQuery({
        todolistId: id,
        params: { page },
    })

    let filteredTasks = data?.items
    if (filter === 'active') {
        filteredTasks = filteredTasks?.filter((task) => task.status === TaskStatus.New)
    }
    if (filter === 'completed') {
        filteredTasks = filteredTasks?.filter((task) => task.status === TaskStatus.Completed)
    }

    if (isLoading) {
        return <TasksSkeleton />
    }

    return (
        <>
            {filteredTasks?.length === 0 ? (
                <p>Тасок нет</p>
            ) : (
                <>
                    <List>
                        {filteredTasks?.map((task) => (
                            <TaskItem key={task.id} task={task} todolist={todolist} />
                        ))}
                    </List>
                    {data?.totalCount && data.totalCount > PAGE_SIZE && (
                        <TasksPagination
                            totalCount={data.totalCount}
                            page={page}
                            setPage={setPage}
                        />
                    )}
                </>
            )}
        </>
    )
}