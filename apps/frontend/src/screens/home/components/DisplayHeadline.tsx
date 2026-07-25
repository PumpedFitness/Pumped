import { Text, View } from 'react-native';

type DisplayHeadlineProps = {
  lead: string;
  subject: string;
};

/**
 * Two-line display headline ("Ready for / Push A"). README §1.2.
 * The lead is muted-weight ink; the subject is the emphasised second line.
 */
export function DisplayHeadline({ lead, subject }: DisplayHeadlineProps) {
  return (
    <View>
      <Text className="text-[34px] font-[800] leading-[1.06] tracking-[-0.68px] text-muted">
        {lead}
      </Text>
      <Text className="text-[34px] font-[800] leading-[1.06] tracking-[-0.68px] text-foreground">
        {subject}
      </Text>
    </View>
  );
}
