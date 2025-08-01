import { baseApi } from '@/app/baseApi'
import type { BaseResponse } from '@/common/types'
import type { DomainTask, GetTasksResponse, UpdateTaskModel } from './tasksApi.types'
import { PAGE_SIZE } from '@/common/constants';

export const tasksApi = baseApi.injectEndpoints({
    endpoints: ( build ) => ({
        getTasks: build.query<GetTasksResponse, {todolistId: string; params: {page: number}}>({
            query: ( {todolistId, params} ) => ({
                url: `todo-lists/${ todolistId }/tasks`,
                params: {...params, count: PAGE_SIZE},
            }),
            // @ts-ignore
            providesTags: ( res, err, {todolistId} ) => [{type: 'Task', id: todolistId}],
        }),
        addTask: build.mutation<BaseResponse<{item: DomainTask}>, {todolistId: string; title: string}>({
            query: ( {todolistId, title} ) => ({
                url: `todo-lists/${ todolistId }/tasks`,
                method: 'POST',
                body: {title},
            }),
            // @ts-ignore
            invalidatesTags: ( res, err, {todolistId} ) => [{type: 'Task', id: todolistId}],
        }),
        removeTask: build.mutation<BaseResponse, {todolistId: string; taskId: string}>({
            query: ( {todolistId, taskId} ) => ({
                url: `todo-lists/${ todolistId }/tasks/${ taskId }`,
                method: 'DELETE',
            }),
            // @ts-ignore
            invalidatesTags: ( res, err, {todolistId} ) => [{type: 'Task', id: todolistId}],
        }),
        updateTask: build.mutation<
            BaseResponse<{item: DomainTask}>,
            {todolistId: string; taskId: string; model: UpdateTaskModel}
        >({
            query: ( {todolistId, taskId, model} ) => ({
                url: `todo-lists/${ todolistId }/tasks/${ taskId }`,
                method: 'PUT',
                body: model,
            }),
            async onQueryStarted( {todolistId, taskId, model}, {dispatch, queryFulfilled, getState} ) {
                const cachedArgsForQuery = tasksApi.util.selectCachedArgsForQuery(getState(), 'getTasks')

                let patchResults: any[] = []
                cachedArgsForQuery.forEach(( {params} ) => {
                    patchResults.push(
                        dispatch(
                            tasksApi.util.updateQueryData('getTasks', {
                                todolistId,
                                params: {page: params.page}
                            }, ( state ) => {
                                const task = state.items.find(( task ) => task.id === taskId)
                                if (task) {
                                    task.status = model.status
                                }
                            }),
                        ),
                    )
                })
                try {
                    await queryFulfilled
                } catch {
                    patchResults.forEach(( patchResult ) => {
                        patchResult.undo()
                    })
                }
            },
            //@ts-ignore
            invalidatesTags: ( res, err, {todolistId} ) => [{type: 'Task', id: todolistId}],
        }),
    }),
})

export const {useGetTasksQuery, useAddTaskMutation, useRemoveTaskMutation, useUpdateTaskMutation} = tasksApi