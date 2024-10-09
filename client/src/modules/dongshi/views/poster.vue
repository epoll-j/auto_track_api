<template>
	<div class="main-container">
		<div class="main-container-top">
			<div>
				<el-upload
					v-model:file-list="fileList"
					ref="uploadRef"
					class="upload-demo"
					:auto-upload="false"
				>
					<template #trigger>
						<el-button type="primary">选择图片</el-button>
					</template>
				</el-upload>
			</div>
			<div>
				<el-form
					ref="formRef"
					style="max-width: 600px"
					:model="dynamicValidateForm"
					label-width="auto"
					class="demo-dynamic"
				>
					<el-form-item
						v-for="(book, index) in dynamicValidateForm.books"
						:key="book.key"
						:label="'书本' + index"
						:prop="'book.' + index + '.value'"
					>
						<el-input v-model="book.value" type="textarea" />
						<el-button style="margin-top: 10px" @click.prevent="removeBook(book)">
							Delete
						</el-button>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitForm(formRef)">Generate</el-button>
						<el-button @click="addBook">New Book</el-button>
					</el-form-item>
				</el-form>
			</div>
		</div>
		<div class="main-container-bottom">
			<div class="preview-box">
				<div class="main-container-bottom-preview">
					<img :src="backgroundImgSrc" />
					<div class="main-container-bottom-preview-content">
						<div class="main-container-bottom-preview-content-text">
							<div class="main-container-bottom-preview-content-text-title">
								{{ gptContent.chinese.title }}
							</div>
							<div class="main-container-bottom-preview-content-text-body">
								{{ gptContent.chinese.body }}
							</div>
						</div>
						<div class="main-container-bottom-preview-content-text">
							<div class="main-container-bottom-preview-content-text-title">
								{{ gptContent.english.title }}
							</div>
							<div class="main-container-bottom-preview-content-text-body">
								{{ gptContent.english.body }}
							</div>
						</div>
						<div class="main-container-bottom-preview-content-logo">
							<div class="main-container-bottom-preview-content-logo-line"></div>
							洞识 APP
							<div class="main-container-bottom-preview-content-logo-line"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" name="ds-book" setup>
import { reactive, ref } from "vue";
import type { FormInstance, UploadInstance } from "element-plus";
import html2canvas from "html2canvas";
import { useCool } from "/@/cool";

const { service } = useCool();

const formRef = ref<FormInstance>();
const uploadRef = ref<UploadInstance>();
const fileList = ref<any[]>([]);
const backgroundImgSrc = ref<string>("");
const dynamicValidateForm = reactive<{
	books: DomainItem[];
}>({
	books: [
		{
			key: 1,
			value: '{"title": "", "content": ""}'
		}
	]
});

const gptContent = reactive({
	chinese: {
		title: "title",
		body: "body"
	},
	english: {
		title: "title",
		body: "body"
	}
});

interface DomainItem {
	key: number;
	value: string;
}

const removeBook = (item: DomainItem) => {
	const index = dynamicValidateForm.books.indexOf(item);
	if (index !== -1) {
		dynamicValidateForm.books.splice(index, 1);
	}
};

const addBook = () => {
	dynamicValidateForm.books.push({
		key: Date.now(),
		value: '{"title": "", "content": ""}'
	});
};

const delay = (ms, title) => {
	return new Promise((resolve) =>
		setTimeout(() => {
			html2canvas(
				document.querySelector(".main-container-bottom-preview") as HTMLElement
			).then((canvas) => {
				const link = document.createElement("a");
				link.download = `${title}.png`;
				link.href = canvas.toDataURL("image/png");
				link.click();
			});
			resolve(title);
		}, ms)
	);
};

const submitForm = async (formEl: FormInstance | undefined) => {
	for (let i = 0; i < fileList.value.length; i++) {
		const img = fileList.value[i].raw;
		backgroundImgSrc.value = URL.createObjectURL(img);
		const book = JSON.parse(dynamicValidateForm.books[i].value.replace(/[\n\r\t]/g, ""));
		const result = await service.dongshi.open.gpt({
			prompt: book.content
		});
		const gptResult = JSON.parse(result);
		for (let j = 0; j < gptResult.length; j++) {
			const item = gptResult[j];
			item.chinese.title = `${j + 1} .${item.chinese.title}`;
			item.english.title = `${j + 1} .${item.english.title}`;

			Object.assign(gptContent, item);
			await delay(2000, `${book.title || "title"} - ${j + 1}`);
		}
	}
};
</script>

<style lang="scss" scoped>
@font-face {
	font-family: "ds";
	src: url("http://cdn.iflow.mobi/jianshu/%E4%B8%B4%E6%97%B6/%E6%A0%87%E9%A2%98%E5%8F%8A%E5%86%85%E5%AE%B9%E5%AD%97%E4%BD%93/SourceHanSerifCN-Regular-1.otf");
}

@font-face {
	font-family: "ds-title";
	src: url("http://cdn.iflow.mobi/jianshu/%E4%B8%B4%E6%97%B6/%E6%B4%9E%E8%AF%86APP%20%E5%AD%97%E4%BD%93/SourceHanSerifCN-SemiBold-7.otf");
}

.main-container {
	display: flex;
	flex-direction: column;
	padding: 10px;
	background-color: white;
	&-top {
		display: flex;
		justify-content: space-around;
	}
	&-bottom {
		margin-top: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		&-preview {
			position: relative;
			width: 1290px;
			height: 1720px;
			* {
				font-family: ds;
			}
			img {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 0;
			}
			&-content {
				padding: 60px 90px;
				box-sizing: border-box;
				position: relative;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				color: white;
				&-text {
					height: 400px;
					&-title {
						font-size: 75px;
					}
					&-body {
						margin-top: 22px;
						font-size: 46px;
						line-height: 80px;
					}
				}
				&-logo {
					display: flex;
					align-items: center;
					justify-content: space-between;
					color: white;
					font-size: 36px;
					font-family: ds-title;
					&-line {
						height: 2px;
						width: 40%;
						background-color: white;
					}
				}
			}
		}
	}
}

.preview-box {
	width: 258px;
	height: 344px;
	overflow: scroll;
}
</style>
