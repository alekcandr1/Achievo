import { baseApi } from '@/app/baseApi'
import type { BaseResponse } from '@/common/types'
import type { DomainTodolist } from '@/features/todolists/lib/types'
import type { Todolist } from './todolistsApi.types'

export const todolistsApi = baseApi.injectEndpoints({
    endpoints: ( build ) => ({
        getTodolists: build.query<DomainTodolist[], void>({
            query: () => 'todo-lists',
            transformResponse: ( todolists: Todolist[] ): DomainTodolist[] =>
                todolists.map(( todolist ) => ({...todolist, filter: 'all', entityStatus: 'idle'})),
            providesTags: ['Todolist'],
        }),
        addTodolist: build.mutation<BaseResponse<{item: Todolist}>, string>({
            query: ( title ) => ({
                url: 'todo-lists',
                method: 'POST',
                body: {title},
            }),
            invalidatesTags: ['Todolist'],
        }),
        removeTodolist: build.mutation<BaseResponse, string>({
            query: ( id ) => ({
                url: `todo-lists/${ id }`,
                method: 'DELETE',
            }),
            async onQueryStarted( id: string, {dispatch, queryFulfilled} ) {
                const patchResult = dispatch(
                    todolistsApi.util.updateQueryData('getTodolists', undefined, ( state ) => {
                        const index = state.findIndex(( todolist ) => todolist.id === id)
                        if (index !== -1) {
                            state.splice(index, 1)
                        }
                    }),
                )
                try {
                    await queryFulfilled
                } catch {
                    patchResult.undo()
                }
            },
            invalidatesTags: ['Todolist'],
        }),
        updateTodolistTitle: build.mutation<BaseResponse, {id: string; title: string}>({
            query: ( {id, title} ) => ({
                url: `todo-lists/${ id }`,
                method: 'PUT',
                body: {title},
            }),
            invalidatesTags: ['Todolist'],
        }),
    }),
})

export const {
    useGetTodolistsQuery,
    useAddTodolistMutation,
    useRemoveTodolistMutation,
    useUpdateTodolistTitleMutation,
} = todolistsApi