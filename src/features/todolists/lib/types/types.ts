import type { RequestStatus } from "@/common/types"
import type { Todolist } from "@/features/todolists/api/todolistsApi.types"

export type DomainTodolist = Todolist & {
  filter: FilterValues
  entityStatus: RequestStatus
}

export type FilterValues = "all" | "active" | "completed"
