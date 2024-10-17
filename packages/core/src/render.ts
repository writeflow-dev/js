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
  components: Components<HostNode>,
  customComponents: Partial<Components<HostNode>>
): HostNode[] {
  const result: HostNode[] = [];
  let tmp: HostNode[] = [];

  blocks.forEach((block, idx) => {
    if (block.type === "bulleted_list_item") {
      const BulletedList = components.bulleted_list;
      const BulletedListItem = components.bulleted_list_item;
      const CustomBulletedList = customComponents.bulleted_list;
      const CustomBulletedListItem = customComponents.bulleted_list_item;
      const children =
        block.children &&
        renderBlocks(block.children, components, customComponents);

      tmp.push(
        CustomBulletedListItem
          ? CustomBulletedListItem({ block, children })
          : BulletedListItem({ block, children })
      );

      if (blocks[idx + 1]?.type !== "bulleted_list_item") {
        result.push(
          CustomBulletedList
            ? CustomBulletedList({ children: tmp })
            : BulletedList({ children: tmp })
        );
        tmp = [];
      }

      return;
    }

    if (block.type === "numbered_list_item") {
      const NumberedList = components.numbered_list;
      const NumberedListItem = components.numbered_list_item;
      const CustomNumberedList = customComponents.numbered_list;
      const CustomNumberedListItem = customComponents.numbered_list_item;
      const children =
        block.children &&
        renderBlocks(block.children, components, customComponents);

      tmp.push(
        CustomNumberedListItem
          ? CustomNumberedListItem({ block, children })
          : NumberedListItem({ block, children })
      );

      if (blocks[idx + 1]?.type !== "numbered_list_item") {
        result.push(
          CustomNumberedList
            ? CustomNumberedList({ children: tmp })
            : NumberedList({ children: tmp })
        );
        tmp = [];
      }

      return;
    }

    if (block.type === "table") {
      const Table = components.table;
      const CustomTable = customComponents.table;
      const children =
        block.children &&
        renderBlocks(block.children, components, customComponents);
      return result.push(
        CustomTable
          ? CustomTable({ block, children })
          : Table({ block, children })
      );
    }

    if (block.type === "table_row") {
      const TableRow = components.table_row;
      const CustomTableRow = customComponents.table_row;
      return result.push(
        CustomTableRow ? CustomTableRow({ block }) : TableRow({ block })
      );
    }

    let CustomComponent = customComponents[block.type];
    let children =
      block.children &&
      renderBlocks(block.children, components, customComponents);

    const defaultComponent = () => {
      switch (block.type) {
        case "audio":
          return components.audio({ block });

        case "bookmark":
          return components.bookmark({ block });

        case "callout":
          return components.callout({ block, children });

        case "code":
          return components.code({ block });

        case "column_list":
          return components.column_list({ block, children });

        case "column":
          return components.column({ block, children });

        case "divider":
          return components.divider({ block });

        case "embed":
          return components.embed({ block });

        case "equation":
          return components.equation({ block });

        case "heading_1":
          return components.heading_1({ block, children });

        case "heading_2":
          return components.heading_2({ block, children });

        case "heading_3":
          return components.heading_3({ block, children });

        case "image":
          return components.image({ block });

        case "paragraph":
          return components.paragraph({ block, children });

        case "quote":
          return components.quote({ block, children });

        case "to_do":
          return components.to_do({ block, children });

        case "toggle":
          return components.toggle({ block, children });

        case "unsupported":
          return components.unsupported({ block });

        default:
          // @ts-expect-error
          return components.unsupported({ block });
      }
    };

    result.push(
      CustomComponent
        ? // @ts-expect-error
          CustomComponent({ block, children })
        : defaultComponent()
    );
  });

  return result;
}

export { renderBlocks };
