// ユーザーが入力するフォーム
export interface Form extends HTMLFormElement {
  validate(): boolean
}
