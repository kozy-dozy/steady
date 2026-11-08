import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
    apiGetMe,
    apiUpdateMe,
    type GetMeResponse,
} from '@/services/shared/AccountService'

import type { MemberDto } from '@shared/dtos'

export type MemberState = {
    member: MemberDto | null
    loading: boolean
    error: string | null
}

const initialState: MemberState = {
    member: null,
    loading: false,
    error: null,
}

export const fetchMember = createAsyncThunk(
    'member/fetchMember',
    async (_, { rejectWithValue }) => {
        try {
            const res = await apiGetMe<GetMeResponse>()
            return res.member ?? null
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Failed to fetch member')
        }
    },
)

export const updateMember = createAsyncThunk(
    'member/updateMember',
    async (payload: Record<string, any>, { rejectWithValue }) => {
        try {
            const res = await apiUpdateMe<GetMeResponse>(payload)
            return res.member ?? null
        } catch (error: any) {
            return rejectWithValue(error?.message || 'Failed to update member')
        }
    },
)

const memberSlice = createSlice({
    name: 'member',
    initialState,
    reducers: {
        clearMember: (state) => {
            state.member = null
            state.error = null
        },
        resetMemberError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMember.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchMember.fulfilled, (state, action) => {
                state.loading = false
                state.member = action.payload
            })
            .addCase(fetchMember.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
                state.member = null
            })
            .addCase(updateMember.fulfilled, (state, action) => {
                state.member = action.payload
            })
            .addCase(updateMember.rejected, (state, action) => {
                state.error = action.payload as string
            })
    },
})

export const { clearMember, resetMemberError } = memberSlice.actions
export default memberSlice.reducer
