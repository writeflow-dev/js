import type { Block } from "@writeflow/types";

export type PickBlock<T extends Block["type"]> = Extract<Block, { type: T }>;

type Component<
  HostNode extends any,
  T extends Block["type"],
  Children extends boolean = false
> = (
  props: Children extends false
    ? {
        block: PickBlock<T>;
      }
    : { block: PickBlock<T>; children: HostNode[] | null }
) => HostNode;

type Container<HostNode> = (props: { children: HostNode[] }) => HostNode;

export type Components<HostNode> = {
  bulleted_list: Container<HostNode>;
  numbered_list: Container<HostNode>;

  bulleted_list_item: Component<HostNode, "bulleted_list_item", true>;
  numbered_list_item: Component<HostNode, "numbered_list_item", true>;
  callout: Component<HostNode, "callout", true>;
  child_database: Component<HostNode, "child_database", true>;
  child_page: Component<HostNode, "child_page", true>;
  column_list: Component<HostNode, "column_list", true>;
  column: Component<HostNode, "column", true>;
  heading_1: Component<HostNode, "heading_1", true>;
  heading_2: Component<HostNode, "heading_2", true>;
  heading_3: Component<HostNode, "heading_3", true>;
  paragraph: Component<HostNode, "paragraph", true>;
  quote: Component<HostNode, "quote", true>;
  synced_block: Component<HostNode, "synced_block", true>;
  table: Component<HostNode, "table", true>;
  table_row: Component<HostNode, "table_row">;
  to_do: Component<HostNode, "to_do", true>;
  toggle: Component<HostNode, "toggle", true>;

  audio: Component<HostNode, "audio">;
  bookmark: Component<HostNode, "bookmark">;
  breadcrumb: Component<HostNode, "breadcrumb">;
  code: Component<HostNode, "code">;
  divider: Component<HostNode, "divider">;
  embed: Component<HostNode, "embed">;
  equation: Component<HostNode, "equation">;
  file: Component<HostNode, "file">;
  image: Component<HostNode, "image">;
  link_preview: Component<HostNode, "link_preview">;
  link_to_content: Component<HostNode, "link_to_content">;
  link_to_page: Component<HostNode, "link_to_page">;
  mention: {};
  pdf: Component<HostNode, "pdf">;
  table_of_contents: Component<HostNode, "table_of_contents">;
  template: Component<HostNode, "template">;
  video: Component<HostNode, "video">;
  unsupported: Component<HostNode, "unsupported">;
};

function renderBlocks<HostNode>(
  blocks: Block[],
  components: Partial<Components<HostNode>>
): HostNode[] {
  const result: HostNode[] = [];
  let tmp: HostNode[] = [];

  blocks.forEach((block, idx) => {
    if (block.type === "bulleted_list_item") {
      const BulletedList = components.bulleted_list;
      const BulletedListItem = components.bulleted_list_item;
      const children =
        block.children && renderBlocks(block.children, components);

      if (BulletedListItem) {
        tmp.push(BulletedListItem({ block, children }));
      }

      if (blocks[idx + 1]?.type !== "bulleted_list_item") {
        if (BulletedList) {
          result.push(BulletedList({ children: tmp }));
        }
        tmp = [];
      }

      return;
    }

    if (block.type === "numbered_list_item") {
      const NumberedList = components.numbered_list;
      const NumberedListItem = components.numbered_list_item;
      const children =
        block.children && renderBlocks(block.children, components);

      if (NumberedListItem) {
        tmp.push(NumberedListItem({ block, children }));
      }

      if (blocks[idx + 1]?.type !== "numbered_list_item") {
        if (NumberedList) {
          result.push(NumberedList({ children: tmp }));
        }
        tmp = [];
      }

      return;
    }

    if (block.type === "table") {
      const Table = components.table;
      const children =
        block.children && renderBlocks(block.children, components);
      if (Table) {
        result.push(Table({ block, children }));
      }
      return;
    }

    if (block.type === "table_row") {
      const TableRow = components.table_row;
      if (TableRow) {
        result.push(TableRow({ block }));
      }
      return;
    }

    let children = block.children && renderBlocks(block.children, components);

    const defaultComponent = () => {
      switch (block.type) {
        case "audio":
          return components.audio ? components.audio({ block }) : null;

        case "bookmark":
          return components.bookmark ? components.bookmark({ block }) : null;

        case "callout":
          return components.callout
            ? components.callout({ block, children })
            : null;

        case "code":
          return components.code ? components.code({ block }) : null;

        case "column_list":
          return components.column_list
            ? components.column_list({ block, children })
            : null;

        case "column":
          return components.column
            ? components.column({ block, children })
            : null;

        case "divider":
          return components.divider ? components.divider({ block }) : null;

        case "embed":
          return components.embed ? components.embed({ block }) : null;

        case "equation":
          return components.equation ? components.equation({ block }) : null;

        case "heading_1":
          return components.heading_1
            ? components.heading_1({ block, children })
            : null;

        case "heading_2":
          return components.heading_2
            ? components.heading_2({ block, children })
            : null;

        case "heading_3":
          return components.heading_3
            ? components.heading_3({ block, children })
            : null;

        case "image":
          return components.image ? components.image({ block }) : null;

        case "link_to_content":
          return components.link_to_content
            ? components.link_to_content({ block })
            : null;

        case "paragraph":
          return components.paragraph
            ? components.paragraph({ block, children })
            : null;

        case "quote":
          return components.quote
            ? components.quote({ block, children })
            : null;

        case "to_do":
          return components.to_do
            ? components.to_do({ block, children })
            : null;

        case "toggle":
          return components.toggle
            ? components.toggle({ block, children })
            : null;

        case "unsupported":
          return components.unsupported
            ? components.unsupported({ block })
            : null;

        default:
          return components.unsupported
            ? // @ts-expect-error
              components.unsupported({ block })
            : null;
      }
    };

    const component = defaultComponent();
    if (component) {
      result.push(component);
    }
  });

  return result;
}

export { renderBlocks };
