<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />
			<!-- 新增按钮 -->
			<cl-add-btn />
			<!-- 删除按钮 -->
			<cl-multi-delete-btn />
			<cl-flex1 />
			<!-- 关键字搜索 -->
			<cl-search-key />
		</cl-row>

		<cl-row>
			<!-- 数据表格 -->
			<cl-table ref="Table">
				<template #column-book_ids="{ scope }">
					<el-tag
						:key="id"
						style="margin-right: 5px; margin-bottom: 2px"
						v-for="id in scope.row.book_ids"
						>{{ id }}</el-tag
					>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<!-- 分页控件 -->
			<cl-pagination />
		</cl-row>

		<!-- 新增、编辑 -->
		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script lang="ts" name="dongshi-collection" setup>
import { useCrud, useTable, useUpsert } from "@cool-vue/crud";
import { useCool } from "/@/cool";

const { service } = useCool();

// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			label: "合集标题",
			prop: "title",
			component: { name: "el-input", props: { clearable: true } },
			required: true
		},
		{ label: "合集封面", prop: "cover", component: { name: "el-input" }, required: true },
		{
			label: "合集简介",
			prop: "summary",
			required: true,
			component: { name: "el-input", props: { type: "textarea", rows: 4 }, required: true }
		},
		{
			label: "合集详情",
			prop: "details",
			required: true,
			component: { name: "el-input", props: { type: "textarea", rows: 4 }, required: true }
		},
		{
			label: "书本ID列表",
			prop: "book_ids",
			required: true,
			component: {
				name: "el-select",
				props: {
					multiple: true,
					"allow-create": true,
					filterable: true
				}
			}
		},
		{
			label: "排序字段",
			prop: "sort_by",
			hook: "number",
			component: { name: "el-input-number" }
		},
		{
			label: "状态",
			prop: "status",
			hook: "number",
			component: { name: "el-input-number" }
		}
	]
});

// cl-table
const Table = useTable({
	columns: [
		{ type: "selection" },
		{ label: "合集标题", prop: "title", minWidth: 140 },
		{
			label: "合集封面",
			prop: "cover",
			minWidth: 100,
			component: { name: "cl-image", props: { size: 60 } }
		},
		{ label: "合集简介", prop: "summary", showOverflowTooltip: true, minWidth: 200 },
		{
			label: "合集详情",
			prop: "details",
			minWidth: 120,
			showOverflowTooltip: true
		},
		{ label: "书本ID列表", prop: "book_ids" },
		{ label: "排序参数", prop: "sort_by" },
		{ label: "状态", prop: "status" },
		{
			label: "创建时间",
			prop: "createTime",
			minWidth: 170,
			sortable: "custom",
			component: { name: "cl-date-text" }
		},
		{
			label: "更新时间",
			prop: "updateTime",
			minWidth: 170,
			sortable: "custom",
			component: { name: "cl-date-text" }
		},
		{ type: "op", buttons: ["edit", "delete"] }
	]
});

// cl-crud
const Crud = useCrud(
	{
		service: service.dongshi.collection
	},
	(app) => {
		app.refresh();
	}
);
</script>
