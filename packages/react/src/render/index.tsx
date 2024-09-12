import * as React from "react";
import type { ComponentType, ReactNode } from "react";
import type { Block, Notion } from "@writeflow/types";

export type PickBlock<T extends Block["type"]> = Extract<Block, { type: T }>;

type Component<
  T extends Block["type"],
  Children extends boolean = false
> = ComponentType<
  Children extends false
    ? {
        block: PickBlock<T>;
      }
    : { block: PickBlock<T>; children: ReactNode }
>;

type Container = ComponentType<{ children: ReactNode }>;
type RichTextComponent = ComponentType<{ rich_text: Notion.RichTextItem[] }>;

export type Components = {
  bulleted_list?: Container;
  numbered_list?: Container;
  rich_text?: RichTextComponent;

  bulleted_list_item?: Component<"bulleted_list_item", true>;
  numbered_list_item?: Component<"numbered_list_item", true>;
  callout?: Component<"callout", true>;
  child_database?: Component<"child_database", true>;
  child_page?: Component<"child_page", true>;
  column_list?: Component<"column_list", true>;
  column?: Component<"column", true>;
  heading_1?: Component<"heading_1", true>;
  heading_2?: Component<"heading_2", true>;
  heading_3?: Component<"heading_3", true>;
  paragraph?: Component<"paragraph", true>;
  quote?: Component<"quote", true>;
  synced_block?: Component<"synced_block", true>;
  table?: Component<"table", true>;
  table_row?: Component<"table_row">;
  to_do?: Component<"to_do", true>;
  toggle?: Component<"toggle", true>;

  audio?: Component<"audio">;
  bookmark?: Component<"bookmark">;
  breadcrumb?: Component<"breadcrumb">;
  code?: Component<"code">;
  divider?: Component<"divider">;
  embed?: Component<"embed">;
  equation?: Component<"equation">;
  file?: Component<"file">;
  image?: Component<"image">;
  link_preview?: Component<"link_preview">;
  link_to_page?: Component<"link_to_page">;
  mention?: {};
  pdf?: Component<"pdf">;
  table_of_contents?: Component<"table_of_contents">;
  template?: Component<"template">;
  video?: Component<"video">;
  unsupported?: Component<"unsupported">;
};

export function renderBlocks(
  blocks: Block[],
  components?: Components
): ReactNode[] {
  const result: ReactNode[] = [];
  let tmp: ReactNode[] = [];

  blocks.forEach((block, idx) => {
    const RichText = components?.rich_text
      ? components.rich_text
      : RichTextDefault;

    if (block.type === "bulleted_list_item") {
      const BulletedList = components?.bulleted_list;
      const BulletedListItem = components?.bulleted_list_item;
      const children = block.children && renderBlocks(block.children);

      tmp.push(
        BulletedListItem ? (
          <BulletedListItem key={block.id} block={block}>
            {children}
          </BulletedListItem>
        ) : (
          <li key={block.id}>
            <RichText
              key={block.id}
              rich_text={block.bulleted_list_item.rich_text}
            />
            {children && <div style={{ marginLeft: 24 }}>{children}</div>}
          </li>
        )
      );

      if (blocks[idx + 1]?.type !== "bulleted_list_item") {
        result.push(
          BulletedList ? (
            <BulletedList key={block.id}>{tmp}</BulletedList>
          ) : (
            <ul key={block.id}>{tmp}</ul>
          )
        );
        tmp = [];
      }

      return;
    }

    if (block.type === "numbered_list_item") {
      const NumberedList = components?.numbered_list;
      const NumberedListItem = components?.numbered_list_item;
      const children = block.children && renderBlocks(block.children);

      tmp.push(
        NumberedListItem ? (
          <NumberedListItem key={block.id} block={block}>
            {children}
          </NumberedListItem>
        ) : (
          <li key={block.id}>
            <RichText
              key={block.id}
              rich_text={block.numbered_list_item.rich_text}
            />
            {children && <div style={{ marginLeft: 24 }}>{children}</div>}
          </li>
        )
      );

      if (blocks[idx + 1]?.type !== "numbered_list_item") {
        result.push(
          NumberedList ? (
            <NumberedList key={block.id}>{tmp}</NumberedList>
          ) : (
            <ol key={block.id}>{tmp}</ol>
          )
        );
        tmp = [];
      }

      return;
    }

    if (block.type === "table") {
      const children = block.children && renderBlocks(block.children);
      return result.push(
        <table key={block.id}>
          <tbody>{children}</tbody>
        </table>
      );
    }

    if (block.type === "table_row") {
      return result.push(
        <tr key={block.id}>
          {block.table_row.cells.map((cell, i) => (
            <td key={i}>
              <RichText rich_text={cell} />
            </td>
          ))}
        </tr>
      );
    }

    let Component = components && components[block.type];
    let children = block.children && renderBlocks(block.children);

    const defaultComponent = (children: ReactNode[] | null) => {
      switch (block.type) {
        case "audio":
          return (
            <audio key={block.id} controls>
              <source
                src={
                  block.audio.type === "file"
                    ? block.audio.file.url
                    : block.audio.external.url
                }
              />
              Your browser does not support the audio element.
            </audio>
          );

        case "bookmark":
          return (
            <div key={block.id}>
              <p>
                <RichText rich_text={block.bookmark.caption} />
              </p>
              <a href={block.bookmark.url}>{block.bookmark.url}</a>
            </div>
          );

        case "callout":
          return (
            <div key={block.id}>
              <span>
                {block.callout.icon?.type === "emoji"
                  ? block.callout.icon?.emoji
                  : "X"}
              </span>
              <RichText rich_text={block.callout.rich_text} />
              <div style={{ marginLeft: 24 }}>{children}</div>
            </div>
          );

        case "code":
          return (
            <pre key={block.id}>
              <code>
                <RichText rich_text={block.code.rich_text} />
              </code>
            </pre>
          );

        case "column_list":
          return (
            <div key={block.id} style={{ display: "flex" }}>
              {children}
            </div>
          );

        case "column":
          return (
            <div key={block.id} style={{ flex: 1 }}>
              {children}
            </div>
          );

        case "divider":
          return <hr key={block.id} />;

        case "embed":
          return <iframe key={block.id} src={block.embed.url} />;

        case "equation":
          return <p key={block.id}>{block.equation.expression}</p>;

        case "heading_1":
          if (block.heading_1.is_toggleable) {
            return (
              <details key={block.id}>
                <summary>
                  <h1 key={block.id}>
                    <RichText rich_text={block.heading_1.rich_text} />
                  </h1>
                </summary>
                {children}
              </details>
            );
          }
          return (
            <h1 key={block.id}>
              <RichText rich_text={block.heading_1.rich_text} />
            </h1>
          );

        case "heading_2":
          if (block.heading_2.is_toggleable) {
            return (
              <details key={block.id}>
                <summary>
                  <h2 key={block.id}>
                    <RichText rich_text={block.heading_2.rich_text} />
                  </h2>
                </summary>
                {children}
              </details>
            );
          }
          return (
            <h2 key={block.id}>
              <RichText rich_text={block.heading_2.rich_text} />
            </h2>
          );

        case "heading_3":
          if (block.heading_3.is_toggleable) {
            return (
              <details key={block.id}>
                <summary>
                  <h3 key={block.id}>
                    <RichText rich_text={block.heading_3.rich_text} />
                  </h3>
                </summary>
                {children}
              </details>
            );
          }
          return (
            <h3 key={block.id}>
              <RichText rich_text={block.heading_3.rich_text} />
            </h3>
          );

        case "image":
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={block.id}
              src={block.image.file.url}
              alt={block.image.caption.map((c) => c.plain_text).join("")}
            />
          );

        case "paragraph":
          return (
            <React.Fragment key={block.id}>
              <p>
                <RichText rich_text={block.paragraph.rich_text} />
              </p>
              {children && <div style={{ marginLeft: 24 }}>{children}</div>}
            </React.Fragment>
          );

        case "quote":
          return (
            <blockquote
              key={block.id}
              style={{ borderLeft: "4px solid black", paddingLeft: 8 }}
            >
              <RichText rich_text={block.quote.rich_text} />
              {children}
            </blockquote>
          );

        case "to_do":
          return (
            <div key={block.id}>
              <input
                id={block.id}
                type="checkbox"
                checked={block.to_do.checked}
                disabled
              />
              <label htmlFor={block.id}>
                <RichText rich_text={block.to_do.rich_text} />
              </label>
              {children}
            </div>
          );

        case "toggle":
          return (
            <details key={block.id}>
              <summary>
                <RichText rich_text={block.toggle.rich_text} />
              </summary>
              {children}
            </details>
          );

        case "unsupported":
          return <p key={block.id}>unsupported</p>;

        default:
          return (
            <div key={block.id}>
              There are no default component yet: {block.type}
            </div>
          );
      }
    };

    result.push(
      Component ? (
        // @ts-expect-error
        <Component key={block.id} block={block}>
          {children}
        </Component>
      ) : (
        defaultComponent(children)
      )
    );
  });

  return result;
}

function RichTextDefault({
  rich_text,
}: {
  key?: string;
  rich_text: Notion.RichTextItem[];
}) {
  return (
    <>
      {rich_text.map((r) => {
        let result = <React.Fragment>{r.plain_text}</React.Fragment>;
        if (r.annotations.bold) result = <b>{result}</b>;
        if (r.annotations.italic) result = <i>{result}</i>;
        if (r.annotations.strikethrough) result = <s>{result}</s>;
        if (r.annotations.underline) result = <u>{result}</u>;
        if (r.annotations.code) result = <code>{result}</code>;
        if (r.href) result = <a href={r.href}>{result}</a>;
        return <React.Fragment key={r.plain_text}>{result}</React.Fragment>;
      })}
    </>
  );
}
