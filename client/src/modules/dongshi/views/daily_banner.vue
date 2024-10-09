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
		</cl-row>

		<cl-row>
			<!-- 数据表格 -->
			<cl-table ref="Table" />
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

<script lang="ts" name="daily_banner" setup>
import { useCrud, useTable, useUpsert } from "@cool-vue/crud";
import { useCool } from "/@/cool";

const { service } = useCool();

// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			label: "书本ID",
			prop: "book_id",
			hook: "number",
			component: { name: "el-input-number" },
			required: true
		},
		{
			label: "推送标题",
			prop: "apns_title",
			component: { name: "el-input", props: { clearable: true } },
			required: true
		},
		{
			label: "推送内容",
			prop: "apns_body",
			component: { name: "el-input", props: { type: "textarea", rows: 4 } },
			required: true
		},
		{
			label: "排序字段",
			prop: "sort_by",
			hook: "number",
			component: { name: "el-input-number" },
			// required: true
		}
	]
});

// cl-table
const Table = useTable({
	columns: [
		{ type: "selection" },
		{ label: "书本ID", prop: "book_id", minWidth: 140 },
		{ label: "推送标题", prop: "apns_title", minWidth: 140 },
		{ label: "推送内容", prop: "apns_body", showOverflowTooltip: true, minWidth: 200 },
		{ label: "排序字段", prop: "sort_by", minWidth: 140 },
		// {
		// 	label: "创建时间",
		// 	prop: "create_time",
		// 	minWidth: 170,
		// 	sortable: "custom",
		// 	component: { name: "cl-date-text" }
		// },
		// {
		// 	label: "更新时间",
		// 	prop: "update_time",
		// 	minWidth: 170,
		// 	sortable: "custom",
		// 	component: { name: "cl-date-text" }
		// },
		{ type: "op", buttons: ["edit", "delete"] }
	]
});

// cl-crud
const Crud = useCrud(
	{
		service: service.dongshi.daily_banner
	},
	(app) => {
		app.refresh();
	}
);
</script>
