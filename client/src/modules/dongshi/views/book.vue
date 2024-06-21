<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-multi-delete-btn />
			<el-button @click="visible = true">导入</el-button>
			<cl-flex1 />
			<cl-search-key placeholder="搜索名称" />
		</cl-row>

		<cl-row>
			<cl-table ref="Table">
				<template #column-tags="{ scope }">
					<el-tag :key="tag" style="margin-right: 5px" v-for="tag in scope.row.tags">{{
						tag
					}}</el-tag>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<cl-upsert ref="Upsert" />
		<cl-dialog title="导入书籍" v-model="visible">
			<el-upload
				class="upload-demo"
				drag
				accept="html"
				:show-file-list="false"
				:auto-upload="false"
				:on-change="handleFileSelected"
			>
				<el-icon class="el-icon--upload"><upload-filled /></el-icon>
				<div class="el-upload__text">拖拽或<em>点击上传</em></div>
			</el-upload>
			<el-input autosize class="json-input" v-model="bookJson" type="textarea" />
			<el-button :loading="loading" @click="handleUpload" type="primary" class="upload-button"
				>导入</el-button
			>
		</cl-dialog>
	</cl-crud>
</template>

<script lang="ts" name="ds-book" setup>
import { useCrud, useTable, useUpsert } from "@cool-vue/crud";
import { ref } from "vue";
import { useCool } from "/@/cool";
import { UploadFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const { service } = useCool();
const visible = ref(false);
const loading = ref(false);
const bookJson = ref("");

const handleFileSelected = (val) => {
	const { raw } = val;
	if (raw && raw.type === "text/html") {
		const reader = new FileReader();
		reader.onload = function (e) {
			const traget = e.target;
			if (traget) {
				const fileContent = traget.result;
				const parser = new DOMParser();
				const doc: any = parser.parseFromString(fileContent as string, "text/html");
				const title = doc.querySelector(".page-title").innerHTML;
				const body = doc.querySelector(".page-body");
				const result = { title };
				const keyMap = {
					概览: "inside",
					作者名字: "author",
					人物介绍: "about_author",
					外部介绍: "book_desc",
					你能学到: "learn",
					阅读时长: "reading_time",
					人物: "second_author"
				};
				const points: any = [];
				for (let index = 0; index < body.children.length; index++) {
					const dom = body.children[index];
					const type = dom.localName;
					if (type === "h2") {
						const key = dom.innerHTML;
						const value = body.children[index + 1].innerHTML;
						if (keyMap[key]) {
							result[keyMap[key]] = `${value}`
								.replaceAll("&amp;", "&")
								.replaceAll("<br>", "\n");
						}
						index++;
					} else if (type === "h3") {
						const children: any = [];
						for (let i = index + 1; i < body.children.length; i++) {
							const c = body.children[i];
							if (!["h3", "h2"].includes(c.localName)) {
								children.push(c);
							} else {
								index = i - 1;
								break;
							}
						}
						const pointContent: any = [];
						let content = "";
						for (const child of children) {
							const localName = child.localName;
							if (localName === "p") {
								content += `${child.innerHTML}\n\n`;
							} else if (localName === "ol") {
								const index = child.getAttribute("start");
								content += `${index}. ${child.children[0].innerHTML}\n\n`;
							} else if (localName === "blockquote") {
								if (content !== "") {
									pointContent.push({
										type: "content",
										value: content.slice(0, -2)
									});
									content = "";
								}
								pointContent.push({
									type: "quote",
									value: child.innerHTML
								});
							}
						}
						if (content !== "") {
							pointContent.push({
								type: "content",
								value: content
							});
						}
						points.push({
							title: dom.innerHTML,
							content: pointContent
						});
					}
				}
				result["key_point"] = points;
				if (result["learn"]) {
					result["learn"] = result["learn"].replace(/\\n/g, "\n");
				}
				bookJson.value = JSON.stringify(result, null, 4);
			}
		};

		reader.readAsText(raw);
	}
};

const handleUpload = () => {
	loading.value = true;
	service.dongshi.book
		.create(JSON.parse(bookJson.value))
		.then(() => {
			ElMessage.success("导入成功");
			bookJson.value = "";
		})
		.catch((err) => {
			ElMessage.error(err.message);
		})
		.finally(() => {
			loading.value = false;
		});
};
// cl-crud
const Crud = useCrud({ service: service.dongshi.book }, (app) => {
	app.refresh();
});

// cl-table
const Table = useTable({
	columns: [
		{
			type: "selection",
			width: 60
		},
		{
			label: "名称",
			prop: "title",
			minWidth: 150
		},
		{
			label: "时长",
			prop: "reading_time",
			minWidth: 60
		},
		{
			label: "标签",
			prop: "tags"
		},
		{
			label: "作者",
			prop: "author"
		},
		{
			label: "操作",
			type: "op",
			buttons: ["edit", "delete"]
		}
	]
});

// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			prop: "title",
			label: "名称",
			required: true,
			component: {
				name: "el-input"
			}
		},
		{
			prop: "tags",
			label: "标签",
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
			prop: "reading_time",
			label: "时长",
			required: true,
			component: {
				name: "el-input"
			}
		},
		{
			prop: "author",
			label: "作者",
			required: true,
			component: {
				name: "el-input"
			}
		},
		{
			prop: "second_author",
			label: "人物",
			required: true,
			component: {
				name: "el-input"
			}
		},
		{
			prop: "about_author",
			label: "人物介绍",
			required: true,
			component: {
				name: "el-input"
			}
		},
		{
			prop: "book_desc",
			label: "外部介绍",
			required: true,
			component: {
				name: "el-input"
			}
		},
		{
			prop: "inside",
			label: "概览",
			required: true,
			component: {
				name: "el-input"
			}
		},
		{
			prop: "learn",
			label: "你能学到",
			required: true,
			component: {
				name: "el-input"
			}
		}
	]
});
</script>

<style lang="scss" scoped>
.json-input {
	margin: 10px 0;
}
.upload-button {
	width: 100%;
}
</style>
