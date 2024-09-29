<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-multi-delete-btn />
			<el-button @click="visible = true">导入</el-button>
			<el-button @click="open">生成海报</el-button>
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
		<cl-form ref="Form">
			<template #slot-tips="{ scope }">
				<div class="tips">
					<el-form-item
						v-for="(item, index) in scope.tips"
						:key="index"
						:label="`文本${index + 1}`"
						:prop="`tips.${index}.value`"
						:rules="{
							message: `请填写文本`,
							required: true
						}"
					>
						<div class="row">
							<!-- 输入框 -->
							<el-input
								type="textarea"
								v-model="item.value"
								placeholder="请填写文本"
								:rows="8"
							></el-input>

							<!-- 删除行 -->
							<el-icon @click="rowDel(index)">
								<delete />
							</el-icon>
						</div>
					</el-form-item>

					<!-- 添加行 -->
					<el-row type="flex" justify="end">
						<el-button @click="rowAdd()">添加文本</el-button>
					</el-row>
				</div>
			</template>
		</cl-form>
	</cl-crud>
</template>

<script lang="ts" name="ds-book" setup>
import { useCrud, useForm, useTable, useUpsert } from "@cool-vue/crud";
import { ref } from "vue";
import { useCool } from "/@/cool";
import { UploadFilled, Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const { service } = useCool();
const visible = ref(false);
const posterVisible = ref(false);
const loading = ref(false);
const bookJson = ref("");

const Form = useForm();

function open() {
	Form.value?.open({
		title: "生成海报",
		items: [
			{
				label: "底图",
				prop: "background-img",
				component: {
					name: "cl-upload",
					props: {
						text: "选择底图"
					}
				},
				required: true
			},
			{
				label: "封面图",
				prop: "cover-img",
				component: {
					name: "cl-upload",
					props: {
						text: "选择封面图"
					}
				},
				required: true
			},
			{
				label: "书名",
				prop: "name",
				value: "·上洞识APP听《》解读;·每日整理国内外畅销书关键点;·详见置顶",
				required: true,
				component: {
					name: "el-input"
				}
			},
			{
				prop: "tips",
				value: [
					{
						value: `{
	"top": {
		"title": "1、标题标题标题",
		"body": "内容内;容内容",
		"titleSize": 36,
		"bodySize": 30
	},
	"bottom": {
		"title": "2、titletitle;title",
		"body": "content;content",
		"titleSize": 36,
		"bodySize": 30
	}
}`
					}
				],
				component: {
					name: "slot-tips"
				}
			}
		],
		on: {
			submit(data, { close }) {
				generatePoster(data);
				close();
			}
		}
	});
}

function generatePoster(data) {
	const { cover, background, tips, name } = data;
	const generateCover = () => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		// 设置 Canvas 尺寸
		document.body.appendChild(canvas); // 添加 Canvas 到页面

		const imgA = new Image(); // 声明背景图像
		imgA.crossOrigin = "Anonymous";
		imgA.src = `${background.img}`; // 替换为实际的背景图片链接
		canvas.width = imgA.width;
		canvas.height = imgA.height;
		// 当背景图加载完成后，绘制背景
		imgA.onload = () => {
			canvas.width = imgA.width;
			canvas.height = imgA.height;
			ctx!.drawImage(imgA, 0, 0, canvas.width, canvas.height); // 绘制背景图
			const imgB = new Image(); // 声明前景图像
			imgB.crossOrigin = "Anonymous";
			imgB.src = `${cover.img}`; // 替换为实际的前景图片链接
			// 前景图加载完成后绘制并导出
			imgB.onload = () => {
				ctx!.shadowColor = "rgba(255, 255, 255, 1)"; // 阴影颜色
				ctx!.shadowBlur = 8; // 阴影模糊程度
				ctx!.shadowOffsetX = 2; // X 偏移
				ctx!.shadowOffsetY = 2; // Y 偏移
				const w = canvas.width * 0.7;
				const h = canvas.height * 0.7;
				// 居中放置前景图
				const x = (canvas.width - w) / 2;
				const y = (canvas.height - h) / 2;
				ctx!.drawImage(imgB, x, y, w, h); // 绘制前景图

				exportImg(canvas, "cover");
			};
		};

		// 错误处理
		imgA.onerror = (e) => {
			console.error("背景图加载失败", e);
			document.body.removeChild(canvas); // 移除 Canvas
		};
	};

	const generateTips = (val) => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		// 设置 Canvas 尺寸
		document.body.appendChild(canvas); // 添加 Canvas 到页面

		const imgA = new Image(); // 声明背景图像
		imgA.crossOrigin = "Anonymous";
		imgA.src = `${background.img}`; // 替换为实际的背景图片链接
		const defaultXScale = 0.1;
		// 当背景图加载完成后，绘制背景
		imgA.onload = () => {
			canvas.width = imgA.width;
			canvas.height = imgA.height;
			ctx!.drawImage(imgA, 0, 0, canvas.width, canvas.height); // 绘制背景图

			// 设置文本样式
			ctx!.fillStyle = "white";
			ctx!.textAlign = "left"; // 先设置为左对齐
			ctx!.textBaseline = "middle"; // 设置文本基线为中间

			const drawBody = (content) => {
				const startY = content.y || 100;
				const titleSize = content.titleSize || 36;
				const titleLines = content.title.split(";");
				ctx!.font = `${titleSize}px Arial`;
				const x = content.x || canvas.width * defaultXScale;
				let y = 0;
				for (let i = 0; i < titleLines.length; i++) {
					const line = titleLines[i];
					y = startY + i * titleSize; // 每行的 y 坐标
					ctx!.fillText(line, x, y);
				}

				const bodySize = content.bodySize || 30;
				const bodyLines = content.body.split(";");
				ctx!.font = `${bodySize}px Arial`;
				y += titleSize;
				for (let i = 0; i < bodyLines.length; i++) {
					const line = bodyLines[i];
					y = y + i * bodySize;
					ctx!.fillText(line, x, y);
				}
			};

			const drawBottonLine = () => {
				const text = "洞识APP";
				ctx!.font = "24px Arial"; // 设置字体大小和字体
				const textWidth = ctx!.measureText(text).width; // 计算文本宽度

				// 计算线条起始和结束位置
				const leftLineEndX = (canvas.width - textWidth) / 2 - 10; // 左侧线的结束点
				const rightLineStartX = (canvas.width + textWidth) / 2 + 10; // 右侧线的开始点
				const y = canvas.height - 150; // 文本的 Y 位置
				const x = canvas.width * defaultXScale;
				// 绘制左侧线
				ctx!.beginPath();
				ctx!.moveTo(x, y); // 起始点
				ctx!.lineTo(leftLineEndX, y); // 终止点
				ctx!.strokeStyle = "white"; // 设置线条颜色
				ctx!.lineWidth = 2; // 设置线条宽度
				ctx!.stroke(); // 绘制线条

				// 绘制右侧线
				ctx!.beginPath();
				ctx!.moveTo(rightLineStartX, y); // 起始点
				ctx!.lineTo(canvas.width - x, y); // 终止点
				ctx!.stroke(); // 绘制线条

				// 设置文本颜色
				// 绘制文本
				ctx!.fillText(text, (canvas.width - textWidth) / 2, y); // 在中间绘制文本
			};

			drawBody({ ...val.top, y: canvas.height * 0.2 });
			drawBody({ ...val.bottom, y: canvas.height * 0.6 });
			drawBottonLine();
			exportImg(canvas, "tips");
		};

		// 错误处理
		imgA.onerror = (e) => {
			console.error("背景图加载失败", e);
			document.body.removeChild(canvas); // 移除 Canvas
		};
	};

	const generateBookName = () => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		// 设置 Canvas 尺寸
		document.body.appendChild(canvas); // 添加 Canvas 到页面

		const imgA = new Image(); // 声明背景图像
		imgA.crossOrigin = "Anonymous";
		imgA.src = `${background.img}`; // 替换为实际的背景图片链接
		const defaultXScale = 0.1;
		const defaultYScale = 0.3;
		// 当背景图加载完成后，绘制背景
		imgA.onload = () => {
			canvas.width = imgA.width;
			canvas.height = imgA.height;
			ctx!.drawImage(imgA, 0, 0, canvas.width, canvas.height); // 绘制背景图

			ctx!.shadowColor = "rgba(255, 255, 255, 1)"; // 阴影颜色
			ctx!.shadowBlur = 8; // 阴影模糊程度
			ctx!.shadowOffsetX = 2; // X 偏移
			ctx!.shadowOffsetY = 2; // Y 偏移

			ctx!.fillStyle = "white";
			ctx!.textAlign = "left"; // 先设置为左对齐
			ctx!.textBaseline = "middle"; // 设置文本基线为中间

			const startY = canvas.height * defaultYScale;
			const textLines = ["-", ...name.split(";"), "-"];
			const fontSzie = 80;
			ctx!.font = `${fontSzie}px Arial`;
			const x = canvas.width * defaultXScale;
			let y = 0;
			for (let i = 0; i < textLines.length; i++) {
				const line = textLines[i];
				y = startY + i * (fontSzie * 1.3); // 每行的 y 坐标
				ctx!.fillText(line, x, y);
			}

			exportImg(canvas, "name");
		};

		// 错误处理
		imgA.onerror = (e) => {
			console.error("背景图加载失败", e);
			document.body.removeChild(canvas); // 移除 Canvas
		};
	};

	generateCover();
	for (let i = 0; i < tips.length; i++) {
		generateTips(JSON.parse(tips[i].value));
	}

	generateBookName();
}

function exportImg(canvas, name) {
	// 导出为 PNG
	const link = document.createElement("a");
	link.download = `${name}.png`;
	link.href = canvas.toDataURL("image/png");
	link.click(); // 触发下载

	// 移除 Canvas 元素
	document.body.removeChild(canvas);
}

function rowAdd() {
	Form.value?.form.tips.push({
		value: `{
	"top": {
		"title": "1、标题标题标题",
		"body": "内容内;容内容",
		"titleSize": 36,
		"bodySize": 30
	},
	"bottom": {
		"title": "2、titletitle;title",
		"body": "content;content",
		"titleSize": 36,
		"bodySize": 30
	}
}`
	});
}

function rowDel(index: number) {
	Form.value?.form.tips.splice(index, 1);
}

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
								.replaceAll("<br>", "\n")
								.replaceAll(/\\n/g, "\n");
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
.tips {
	.row {
		display: flex;
		align-items: center;

		.el-input {
			flex: 1;
			margin-right: 10px;
		}

		.el-icon {
			cursor: pointer;

			&:hover {
				color: red;
			}
		}
	}
}
</style>
